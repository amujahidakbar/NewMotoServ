import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { DEFAULT_INTERVALS, normalizeMotorType } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { motorcycleId } = await req.json();

    if (!motorcycleId) {
      return NextResponse.json(
        { error: 'ID motor wajib diisi!' },
        { status: 400 }
      );
    }

    // Verify ownership and get type
    const motors = await db.query(
      'SELECT id, type FROM motorcycles WHERE id = ? AND user_id = ?',
      [motorcycleId, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json(
        { error: 'Sepeda motor tidak ditemukan!' },
        { status: 404 }
      );
    }

    const motor = motors[0];
    const normType = normalizeMotorType(motor.type);
    const defaults = DEFAULT_INTERVALS[normType];

    // Reset intervals in database by updating them to defaults
    for (const [comp, value] of Object.entries(defaults)) {
      await db.query(`
        INSERT INTO intervals (motorcycle_id, component_name, interval_km)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE interval_km = VALUES(interval_km)
      `, [motorcycleId, comp, value]);
    }

    return NextResponse.json({
      message: 'Interval berhasil di-reset ke default pabrikan!',
      intervals: defaults
    });

  } catch (error: any) {
    console.error('Reset Intervals API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mereset interval ke default.' },
      { status: 500 }
    );
  }
}
