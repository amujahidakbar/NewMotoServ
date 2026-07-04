import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

function generateLogId(): string {
  return 'fuel_' + Math.random().toString(36).substring(2, 9);
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await db.query(`
      SELECT fl.id, fl.motorcycle_id AS motorcycleId, DATE_FORMAT(fl.date, '%Y-%m-%d') AS date, fl.odometer, 
             fl.liters, fl.price
      FROM fuel_logs fl
      INNER JOIN motorcycles m ON fl.motorcycle_id = m.id
      WHERE m.user_id = ?
      ORDER BY fl.date DESC, fl.odometer DESC
    `, [user.id]) as any[];

    const formattedLogs = logs.map(log => ({
      ...log,
      date: log.date
    }));

    return NextResponse.json(formattedLogs);

  } catch (error: any) {
    console.error('Fetch Fuel Logs API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat catatan bahan bakar.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { motorcycleId, date, odometer, liters, price } = await req.json();

    if (!motorcycleId || !date || odometer === undefined || !liters || !price) {
      return NextResponse.json(
        { error: 'Semua kolom utama (motor, tanggal, odometer, liter, harga) wajib diisi!' },
        { status: 400 }
      );
    }

    const parsedOdo = parseInt(odometer);
    const parsedLiters = parseFloat(liters);
    const parsedPrice = parseInt(price);

    // Verify ownership of the motorcycle
    const motors = await db.query(
      'SELECT id, current_odo AS currentOdo FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json(
        { error: 'Sepeda motor tidak ditemukan!' },
        { status: 404 }
      );
    }

    const motor = motors[0];
    const logId = generateLogId();

    // 1. Insert fuel log
    await db.query(
      'INSERT INTO fuel_logs (id, motorcycle_id, date, odometer, liters, price) VALUES (?, ?, ?, ?, ?, ?)',
      [logId, motorcycleId, date, parsedOdo, parsedLiters, parsedPrice]
    );

    // 2. Automatically bump motorcycle current odometer if fuel odo is higher
    if (parsedOdo > motor.currentOdo) {
      await db.query(
        'UPDATE motorcycles SET current_odo = ? WHERE id = ?',
        [parsedOdo, motorcycleId]
      );
    }

    return NextResponse.json({
      id: logId,
      motorcycleId,
      date,
      odometer: parsedOdo,
      liters: parsedLiters,
      price: parsedPrice
    });

  } catch (error: any) {
    console.error('Create Fuel Log API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan catatan bahan bakar.' },
      { status: 500 }
    );
  }
}
