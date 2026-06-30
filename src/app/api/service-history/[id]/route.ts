import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch the log and verify ownership (via join with motorcycles)
    const logs = await db.query(`
      SELECT sh.id, sh.motorcycle_id AS motorcycleId, sh.components
      FROM service_history sh
      INNER JOIN motorcycles m ON sh.motorcycle_id = m.id
      WHERE sh.id = ? AND m.user_id = ?
    `, [id, user.id]) as any[];

    if (!logs || logs.length === 0) {
      return NextResponse.json(
        { error: 'Catatan riwayat servis tidak ditemukan!' },
        { status: 404 }
      );
    }

    const log = logs[0];
    const motorcycleId = log.motorcycleId;

    // Parse components
    let components: string[] = [];
    try {
      components = JSON.parse(log.components);
    } catch (e) {
      components = typeof log.components === 'string' ? log.components.split(',') : [];
    }

    // 2. Delete the service log
    await db.query('DELETE FROM service_history WHERE id = ?', [id]);

    // 3. Fetch remaining logs for this motorcycle to recalculate last service
    const remainingLogs = await db.query(
      'SELECT components, odometer FROM service_history WHERE motorcycle_id = ?',
      [motorcycleId]
    ) as any[];

    const parsedRemaining = remainingLogs.map(item => {
      let comps = [];
      try {
        comps = JSON.parse(item.components);
      } catch (e) {
        comps = typeof item.components === 'string' ? item.components.split(',') : [];
      }
      return {
        odometer: item.odometer,
        components: comps
      };
    });

    // 4. Recalculate last service km for each component in the deleted log
    for (const comp of components) {
      // Find logs containing this component
      const matchingLogs = parsedRemaining.filter(item => item.components.includes(comp));

      if (matchingLogs.length > 0) {
        // Sort descending by odometer and get highest
        matchingLogs.sort((a, b) => b.odometer - a.odometer);
        const highestOdo = matchingLogs[0].odometer;

        await db.query(
          'UPDATE last_services SET last_service_km = ? WHERE motorcycle_id = ? AND component_name = ?',
          [highestOdo, motorcycleId, comp]
        );
      } else {
        // Reset to 0 if no other service logs mention this component
        await db.query(
          'UPDATE last_services SET last_service_km = 0 WHERE motorcycle_id = ? AND component_name = ?',
          [motorcycleId, comp]
        );
      }
    }

    return NextResponse.json({ message: 'Riwayat servis berhasil dihapus!' });

  } catch (error: any) {
    console.error('Delete Service History API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus riwayat servis.' },
      { status: 500 }
    );
  }
}
