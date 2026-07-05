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

    const countResult = await db.query('SELECT COUNT(*) AS count FROM users') as any[];
    const count = countResult[0]?.count || 0;

    return NextResponse.json({ count });

  } catch (error: any) {
    console.error('Fetch Users Count Admin API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghitung jumlah pengguna terdaftar.' },
      { status: 500 }
    );
  }
}
