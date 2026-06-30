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
