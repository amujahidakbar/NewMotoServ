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

    // Async push notification check
    const finalOdo = parsedLastService > currentOdo ? parsedLastService : currentOdo;
    const { checkAndNotifyCriticalComponents } = await import('@/lib/notifications');
    checkAndNotifyCriticalComponents(user.id, motorcycleId, finalOdo).catch(() => {});

    return NextResponse.json({ message: 'Komponen kustom berhasil ditambahkan!' });

  } catch (error: any) {
    console.error('Create Custom Component API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan komponen kustom.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { motorcycleId, oldName, newName } = await req.json();

    if (!motorcycleId || !oldName || !newName) {
      return NextResponse.json(
        { error: 'Motor, nama lama, dan nama baru wajib diisi!' },
        { status: 400 }
      );
    }

    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();
    if (!trimmedOld || !trimmedNew) {
      return NextResponse.json({ error: 'Nama komponen tidak boleh kosong!' }, { status: 400 });
    }

    if (trimmedOld.toLowerCase() === trimmedNew.toLowerCase()) {
      return NextResponse.json({ message: 'Nama komponen tidak berubah.' });
    }

    const motors = await db.query(
      'SELECT id FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json({ error: 'Sepeda motor tidak ditemukan!' }, { status: 404 });
    }

    const existing = await db.query(
      'SELECT id FROM intervals WHERE motorcycle_id = ? AND LOWER(component_name) = ?',
      [motorcycleId, trimmedNew.toLowerCase()]
    ) as any[];

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Komponen dengan nama baru ini sudah terdaftar!' },
        { status: 400 }
      );
    }

    await db.query(
      'UPDATE intervals SET component_name = ? WHERE motorcycle_id = ? AND component_name = ?',
      [trimmedNew, motorcycleId, trimmedOld]
    );

    await db.query(
      'UPDATE last_services SET component_name = ? WHERE motorcycle_id = ? AND component_name = ?',
      [trimmedNew, motorcycleId, trimmedOld]
    );

    const logs = await db.query(
      'SELECT id, components FROM service_history WHERE motorcycle_id = ?',
      [motorcycleId]
    ) as any[];

    for (const log of logs) {
      let comps: string[] = [];
      try {
        comps = JSON.parse(log.components);
      } catch (e) {
        comps = typeof log.components === 'string' ? log.components.split(',') : [];
      }
      
      const index = comps.indexOf(trimmedOld);
      if (index !== -1) {
        comps[index] = trimmedNew;
        await db.query(
          'UPDATE service_history SET components = ? WHERE id = ?',
          [JSON.stringify(comps), log.id]
        );
      }
    }

    return NextResponse.json({ message: 'Komponen kustom berhasil diganti namanya!' });

  } catch (error: any) {
    console.error('Rename Component API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengganti nama komponen.' },
      { status: 500 }
    );
  }
}

