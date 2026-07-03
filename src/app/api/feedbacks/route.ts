import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { type, message, email, name } = await req.json();

    if (!type || !message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Kategori dan pesan masukan (minimal 10 karakter) wajib diisi!' },
        { status: 400 }
      );
    }

    let finalUserId: number | null = null;
    let finalEmail = email || '';
    let finalName = name || '';

    if (user) {
      finalUserId = user.id;
      finalEmail = user.email;
      finalName = user.name;
    } else {
      // For guest, check email
      if (!finalEmail || !finalName) {
        return NextResponse.json(
          { error: 'Nama dan email wajib diisi untuk pengguna tamu!' },
          { status: 400 }
        );
      }
    }

    await db.query(
      'INSERT INTO feedbacks (user_id, user_email, user_name, type, message) VALUES (?, ?, ?, ?, ?)',
      [finalUserId, finalEmail, finalName, type, message.trim()]
    );

    return NextResponse.json({ message: 'Masukan berhasil dikirim. Terima kasih!' });

  } catch (error: any) {
    console.error('Create Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengirimkan masukan.' },
      { status: 500 }
    );
  }
}
