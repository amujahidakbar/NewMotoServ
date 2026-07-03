import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export function isAdminEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  return (
    emailLower === 'amujahidakbar@gmail.com' ||
    emailLower.includes('amujahidakbar') ||
    emailLower.includes('mujahid') ||
    emailLower === 'admin@motoserve.web.id'
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access only.' }, { status: 403 });
    }

    const feedbacks = await db.query(`
      SELECT id, user_id AS userId, user_email AS userEmail, user_name AS userName, 
             type, message, created_at AS createdAt
      FROM feedbacks
      ORDER BY created_at DESC
    `) as any[];

    const formattedFeedbacks = feedbacks.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt).toISOString()
    }));

    return NextResponse.json(formattedFeedbacks);

  } catch (error: any) {
    console.error('Fetch Feedbacks Admin API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat masukan pengguna.' },
      { status: 500 }
    );
  }
}
