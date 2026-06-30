import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi!' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await db.query(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah!' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah!' },
        { status: 401 }
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Sign JWT token
    const token = signToken(userPayload);

    // Create response
    const response = NextResponse.json({
      message: 'Login berhasil!',
      user: { id: user.id, name: user.name, email: user.email }
    });

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat login.' },
      { status: 500 }
    );
  }
}
