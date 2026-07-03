import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { isAdminEmail } from '../route';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access only.' }, { status: 403 });
    }

    const { id } = await params;

    // Delete the feedback
    await db.query('DELETE FROM feedbacks WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Masukan berhasil dihapus.' });

  } catch (error: any) {
    console.error('Delete Feedback Admin API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus masukan.' },
      { status: 500 }
    );
  }
}
