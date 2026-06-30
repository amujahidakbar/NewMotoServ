import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all motorcycles belonging to the user.
    // Thanks to ON DELETE CASCADE on foreign keys, this will automatically clear
    // all custom intervals, last service odo values, and service history logs.
    await db.query('DELETE FROM motorcycles WHERE user_id = ?', [user.id]);

    return NextResponse.json({ message: 'Semua data kendaraan dan riwayat berhasil dihapus!' });

  } catch (error: any) {
    console.error('Reset User Data API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data aplikasi.' },
      { status: 500 }
    );
  }
}
