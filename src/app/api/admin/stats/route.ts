import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { isAdminEmail } from '@/app/api/admin/feedbacks/route';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access only.' }, { status: 403 });
    }

    const [
      usersResult,
      motorsResult,
      servicesResult,
      fuelsResult,
      feedbacksResult,
      typesResult
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM users') as Promise<any[]>,
      db.query('SELECT COUNT(*) AS count FROM motorcycles') as Promise<any[]>,
      db.query('SELECT COUNT(*) AS count FROM service_history') as Promise<any[]>,
      db.query('SELECT COUNT(*) AS count FROM fuel_logs') as Promise<any[]>,
      db.query('SELECT COUNT(*) AS count FROM feedbacks') as Promise<any[]>,
      db.query('SELECT type, COUNT(*) AS count FROM motorcycles GROUP BY type') as Promise<any[]>
    ]);

    return NextResponse.json({
      totalUsers: usersResult[0]?.count || 0,
      totalMotorcycles: motorsResult[0]?.count || 0,
      totalServiceLogs: servicesResult[0]?.count || 0,
      totalFuelLogs: fuelsResult[0]?.count || 0,
      totalFeedbacks: feedbacksResult[0]?.count || 0,
      motorcycleTypes: typesResult
    });

  } catch (error: any) {
    console.error('Fetch Stats Admin API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat statistik admin.' },
      { status: 500 }
    );
  }
}
