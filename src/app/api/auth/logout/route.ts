import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Logout berhasil!' });
    
    // Clear cookie by setting maxAge to 0
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat logout.' },
      { status: 500 }
    );
  }
}
