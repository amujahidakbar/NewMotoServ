import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { motorcycles, logs } = await req.json();

    // 1. Sync motorcycles
    if (motorcycles && Array.isArray(motorcycles)) {
      for (const motor of motorcycles) {
        // Check if motorcycle already exists for this user or any user
        const existing = await db.query(
          'SELECT id FROM motorcycles WHERE id = ?',
          [motor.id]
        ) as any[];

        if (existing.length === 0) {
          // Insert motorcycle profile
          await db.query(
            'INSERT INTO motorcycles (id, user_id, name, brand, plate, type, current_odo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [motor.id, user.id, motor.name, motor.brand || '', motor.plate || '', motor.type, motor.currentOdo || 0]
          );

          // Seed intervals
          if (motor.intervals) {
            for (const [comp, val] of Object.entries(motor.intervals)) {
              await db.query(
                'INSERT INTO intervals (motorcycle_id, component_name, interval_km) VALUES (?, ?, ?)',
                [motor.id, comp, val]
              );
            }
          }

          // Seed last service odo values
          if (motor.lastService) {
            for (const [comp, val] of Object.entries(motor.lastService)) {
              await db.query(
                'INSERT INTO last_services (motorcycle_id, component_name, last_service_km) VALUES (?, ?, ?)',
                [motor.id, comp, val]
              );
            }
          }
        }
      }
    }

    // 2. Sync service logs
    if (logs && Array.isArray(logs)) {
      for (const log of logs) {
        // Verify motorcycle exists (foreign key constraint safety)
        const motoExists = await db.query(
          'SELECT id FROM motorcycles WHERE id = ?',
          [log.motorcycleId]
        ) as any[];

        if (motoExists.length > 0) {
          // Check if log already exists
          const existingLog = await db.query(
            'SELECT id FROM service_history WHERE id = ?',
            [log.id]
          ) as any[];

          if (existingLog.length === 0) {
            // Format components to stringified JSON array
            const formattedComps = Array.isArray(log.components) 
              ? JSON.stringify(log.components) 
              : JSON.stringify([]);

            // Insert service log
            await db.query(
              'INSERT INTO service_history (id, motorcycle_id, date, odometer, components, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [log.id, log.motorcycleId, log.date, log.odometer, formattedComps, log.cost || 0, log.notes || '']
            );
          }
        }
      }
    }

    return NextResponse.json({ message: 'Data lokal berhasil disinkronkan ke database cloud!' });

  } catch (error: any) {
    console.error('Sync Local Data API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menyinkronkan data lokal ke database.' },
      { status: 500 }
    );
  }
}
