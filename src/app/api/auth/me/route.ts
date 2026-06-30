import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memeriksa sesi.' },
      { status: 500 }
    );
  }
}
