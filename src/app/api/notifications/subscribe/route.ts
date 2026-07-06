import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json({ error: 'Data subscription tidak lengkap!' }, { status: 400 });
    }

    // Check if subscription endpoint already exists for this user
    const existing = await db.query(
      'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
      [user.id, subscription.endpoint]
    ) as any[];

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth) VALUES (?, ?, ?, ?)',
        [user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );
    }

    return NextResponse.json({ message: 'Perangkat berhasil didaftarkan untuk notifikasi!' });

  } catch (error: any) {
    console.error('Subscribe Notifications API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan notifikasi push.' },
      { status: 500 }
    );
  }
}
