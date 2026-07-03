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

    // Verify ownership of the fuel log (via join with motorcycles)
    const logs = await db.query(`
      SELECT fl.id
      FROM fuel_logs fl
      INNER JOIN motorcycles m ON fl.motorcycle_id = m.id
      WHERE fl.id = ? AND m.user_id = ?
    `, [id, user.id]) as any[];

    if (!logs || logs.length === 0) {
      return NextResponse.json(
        { error: 'Catatan bahan bakar tidak ditemukan!' },
        { status: 404 }
      );
    }

    // Delete the fuel log
    await db.query('DELETE FROM fuel_logs WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Catatan bahan bakar berhasil dihapus!' });

  } catch (error: any) {
    console.error('Delete Fuel Log API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus catatan bahan bakar.' },
      { status: 500 }
    );
  }
}
