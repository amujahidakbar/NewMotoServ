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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { date, odometer, liters, price } = await req.json();

    if (!date || odometer === undefined || !liters || !price) {
      return NextResponse.json(
        { error: 'Semua kolom utama (tanggal, odometer, liter, harga) wajib diisi!' },
        { status: 400 }
      );
    }

    const parsedOdo = parseInt(odometer);
    const parsedLiters = parseFloat(liters);
    const parsedPrice = parseInt(price);

    // Verify ownership of the fuel log (via join with motorcycles)
    const logs = await db.query(`
      SELECT fl.id, fl.motorcycle_id AS motorcycleId
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

    const log = logs[0];

    // Update the fuel log
    await db.query(
      'UPDATE fuel_logs SET date = ?, odometer = ?, liters = ?, price = ? WHERE id = ?',
      [date, parsedOdo, parsedLiters, parsedPrice, id]
    );

    // Verify if the active motorcycle current odo needs to be bumped
    const motors = await db.query(
      'SELECT id, current_odo AS currentOdo FROM motorcycles WHERE id = ?',
      [log.motorcycleId]
    ) as any[];

    if (motors && motors.length > 0) {
      const motor = motors[0];
      if (parsedOdo > motor.currentOdo) {
        await db.query(
          'UPDATE motorcycles SET current_odo = ? WHERE id = ?',
          [parsedOdo, log.motorcycleId]
        );
      }
    }

    return NextResponse.json({
      id,
      motorcycleId: log.motorcycleId,
      date,
      odometer: parsedOdo,
      liters: parsedLiters,
      price: parsedPrice
    });

  } catch (error: any) {
    console.error('Update Fuel Log API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui catatan bahan bakar.' },
      { status: 500 }
    );
  }
}
