import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

function generateLogId(): string {
  return 'log_' + Math.random().toString(36).substring(2, 9);
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch service history for all motorcycles owned by this user
    // We join with motorcycles to verify ownership
    const logs = await db.query(`
      SELECT sh.id, sh.motorcycle_id AS motorcycleId, DATE_FORMAT(sh.date, '%Y-%m-%d') AS date, sh.odometer, 
             sh.components, sh.cost, sh.notes
      FROM service_history sh
      INNER JOIN motorcycles m ON sh.motorcycle_id = m.id
      WHERE m.user_id = ?
      ORDER BY sh.date DESC, sh.odometer DESC
    `, [user.id]) as any[];

    // Parse components back to arrays from JSON strings
    const formattedLogs = logs.map(log => {
      let comps = [];
      try {
        comps = JSON.parse(log.components);
      } catch (e) {
        comps = typeof log.components === 'string' ? log.components.split(',') : [];
      }
      return {
        ...log,
        odometer: parseFloat(log.odometer) || 0,
        date: log.date,
        components: comps
      };
    });

    return NextResponse.json(formattedLogs);

  } catch (error: any) {
    console.error('Fetch Service History API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat riwayat servis.' },
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

    const { motorcycleId, date, odometer, components, cost, notes } = await req.json();

    if (!motorcycleId || !date || odometer === undefined || !components || !Array.isArray(components) || components.length === 0) {
      return NextResponse.json(
        { error: 'Semua kolom utama (motor, tanggal, odometer, komponen) wajib diisi!' },
        { status: 400 }
      );
    }

    const parsedOdo = parseFloat(odometer);
    const parsedCost = parseInt(cost) || 0;

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

    // Begin database transaction to ensure consistency
    const connection = await db.initDB().then(() => {
      // Direct connection helper is safer inside transactional routines,
      // but db.query doesn't return connection. We can execute queries directly as we have db.query, 
      // but to run a transaction with multi-statements we should use a transaction from pool.
      // We will perform actions sequentially.
    });

    // 1. Insert service log
    await db.query(
      'INSERT INTO service_history (id, motorcycle_id, date, odometer, components, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [logId, motorcycleId, date, parsedOdo, JSON.stringify(components), parsedCost, notes || '']
    );

    // 2. Automatically bump motorcycle current odometer if service was done at a higher mileage
    if (parsedOdo > motor.currentOdo) {
      await db.query(
        'UPDATE motorcycles SET current_odo = ? WHERE id = ?',
        [parsedOdo, motorcycleId]
      );
    }

    // 3. Update lastService odometer for each component selected, but only if this service odometer is higher
    for (const comp of components) {
      const lastServiceRows = await db.query(
        'SELECT last_service_km FROM last_services WHERE motorcycle_id = ? AND component_name = ?',
        [motorcycleId, comp]
      ) as any[];

      const currentLastServiceOdo = lastServiceRows.length > 0 ? lastServiceRows[0].last_service_km : 0;

      if (parsedOdo > currentLastServiceOdo) {
        if (lastServiceRows.length > 0) {
          await db.query(
            'UPDATE last_services SET last_service_km = ? WHERE motorcycle_id = ? AND component_name = ?',
            [parsedOdo, motorcycleId, comp]
          );
        } else {
          await db.query(
            'INSERT INTO last_services (motorcycle_id, component_name, last_service_km) VALUES (?, ?, ?)',
            [motorcycleId, comp, parsedOdo]
          );
        }
      }
    }

    return NextResponse.json({
      id: logId,
      motorcycleId,
      date,
      odometer: parsedOdo,
      components,
      cost: parsedCost,
      notes: notes || ''
    });

  } catch (error: any) {
    console.error('Create Service History API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan riwayat servis.' },
      { status: 500 }
    );
  }
}
