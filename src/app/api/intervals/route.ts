import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { motorcycleId, intervals } = await req.json();

    if (!motorcycleId || !intervals || typeof intervals !== 'object') {
      return NextResponse.json(
        { error: 'Motor dan data interval wajib diisi!' },
        { status: 400 }
      );
    }

    // Verify ownership
    const motors = await db.query(
      'SELECT id FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json(
        { error: 'Sepeda motor tidak ditemukan!' },
        { status: 404 }
      );
    }

    // Save/update custom intervals
    for (const [comp, value] of Object.entries(intervals)) {
      const parsedValue = parseInt(value as string);
      if (isNaN(parsedValue) || parsedValue <= 0) continue;

      await db.query(`
        INSERT INTO intervals (motorcycle_id, component_name, interval_km)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE interval_km = VALUES(interval_km)
      `, [motorcycleId, comp, parsedValue]);
    }

    return NextResponse.json({ message: 'Interval servis berhasil diperbarui!' });

  } catch (error: any) {
    console.error('Update Intervals API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui interval servis.' },
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

    const { motorcycleId, componentName, intervalKm, lastServiceKm } = await req.json();

    if (!motorcycleId || !componentName || intervalKm === undefined || lastServiceKm === undefined) {
      return NextResponse.json(
        { error: 'Semua kolom (motor, nama komponen, interval, servis terakhir) wajib diisi!' },
        { status: 400 }
      );
    }

    const trimmedComp = componentName.trim();
    if (!trimmedComp) {
      return NextResponse.json({ error: 'Nama komponen tidak boleh kosong!' }, { status: 400 });
    }

    const parsedInterval = parseInt(intervalKm);
    const parsedLastService = parseFloat(lastServiceKm);

    if (isNaN(parsedInterval) || parsedInterval <= 100) {
      return NextResponse.json(
        { error: 'Interval servis minimal harus lebih besar dari 100 KM!' },
        { status: 400 }
      );
    }

    if (isNaN(parsedLastService) || parsedLastService < 0) {
      return NextResponse.json(
        { error: 'Odometer servis terakhir tidak valid!' },
        { status: 400 }
      );
    }

    // Verify ownership
    const motors = await db.query(
      'SELECT id, current_odo AS currentOdo FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json({ error: 'Sepeda motor tidak ditemukan!' }, { status: 404 });
    }

    // Check for duplicate component name (case-insensitive)
    const existing = await db.query(
      'SELECT id FROM intervals WHERE motorcycle_id = ? AND LOWER(component_name) = ?',
      [motorcycleId, trimmedComp.toLowerCase()]
    ) as any[];

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Komponen dengan nama ini sudah terdaftar pada motor Anda!' },
        { status: 400 }
      );
    }

    const currentOdo = parseFloat(motors[0].currentOdo);
    if (parsedLastService > currentOdo) {
      // Auto-advance motorcycle odometer
      await db.query(
        'UPDATE motorcycles SET current_odo = ? WHERE id = ?',
        [parsedLastService, motorcycleId]
      );
    }

    // Save custom interval
    await db.query(`
      INSERT INTO intervals (motorcycle_id, component_name, interval_km)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE interval_km = VALUES(interval_km)
    `, [motorcycleId, trimmedComp, parsedInterval]);

    // Save last service record
    await db.query(`
      INSERT INTO last_services (motorcycle_id, component_name, last_service_km)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE last_service_km = VALUES(last_service_km)
    `, [motorcycleId, trimmedComp, parsedLastService]);

    return NextResponse.json({ message: 'Komponen kustom berhasil ditambahkan!' });

  } catch (error: any) {
    console.error('Create Custom Component API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan komponen kustom.' },
      { status: 500 }
    );
  }
}
