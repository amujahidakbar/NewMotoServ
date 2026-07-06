import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { DEFAULT_INTERVALS, normalizeMotorType, getComponentsForType } from '@/lib/constants';

// Helper function to generate a unique ID for a motorcycle
function generateMotorId(): string {
  return 'motor_' + Math.random().toString(36).substring(2, 9);
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all motorcycles for this user
    const motorcycles = await db.query(
      'SELECT id, name, brand, plate, type, current_odo AS currentOdo FROM motorcycles WHERE user_id = ?',
      [user.id]
    ) as any[];

    const result = [];

    for (const motor of motorcycles) {
      // 2. Fetch custom intervals for this motorcycle
      const intervalRows = await db.query(
        'SELECT component_name, interval_km FROM intervals WHERE motorcycle_id = ?',
        [motor.id]
      ) as any[];

      const intervals: Record<string, number> = {};
      for (const row of intervalRows) {
        intervals[row.component_name] = row.interval_km;
      }

      // 3. Fetch last service odo values for this motorcycle
      const lastServiceRows = await db.query(
        'SELECT component_name, last_service_km FROM last_services WHERE motorcycle_id = ?',
        [motor.id]
      ) as any[];

      const lastService: Record<string, number> = {};
      for (const row of lastServiceRows) {
        lastService[row.component_name] = parseFloat(row.last_service_km) || 0;
      }

      result.push({
        ...motor,
        currentOdo: parseFloat(motor.currentOdo) || 0,
        intervals,
        lastService
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Fetch Motorcycles API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data motor.' },
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

    const { name, brand, plate, type, currentOdo } = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama motor dan tipe motor wajib diisi!' },
        { status: 400 }
      );
    }

    const parsedOdo = parseFloat(currentOdo) || 0.0;
    const motorId = generateMotorId();

    // 1. Insert motorcycle
    await db.query(
      'INSERT INTO motorcycles (id, user_id, name, brand, plate, type, current_odo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [motorId, user.id, name, brand || '', plate || '', type, parsedOdo]
    );

    // 2. Get default components based on normalized motorcycle type
    const normType = normalizeMotorType(type);
    const defaultIntervalsForType = DEFAULT_INTERVALS[normType];

    // 3. Seed intervals and last service records
    const components = Object.keys(defaultIntervalsForType);
    for (const comp of components) {
      const defInt = defaultIntervalsForType[comp as keyof typeof defaultIntervalsForType];
      
      // Seed interval
      await db.query(
        'INSERT INTO intervals (motorcycle_id, component_name, interval_km) VALUES (?, ?, ?)',
        [motorId, comp, defInt]
      );

      // Seed last service as 0
      await db.query(
        'INSERT INTO last_services (motorcycle_id, component_name, last_service_km) VALUES (?, ?, ?)',
        [motorId, comp, 0]
      );
    }

    // 4. Return new motor structure matching client expectations
    const motorData = {
      id: motorId,
      name,
      brand: brand || '',
      plate: plate || '',
      type,
      currentOdo: parsedOdo,
      intervals: { ...defaultIntervalsForType },
      lastService: components.reduce((acc, comp) => {
        acc[comp] = 0;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json(motorData);

  } catch (error: any) {
    console.error('Create Motorcycle API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan motor baru.' },
      { status: 500 }
    );
  }
}
