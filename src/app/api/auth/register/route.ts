import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua kolom wajib diisi!' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal harus 6 karakter!' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Alamat email sudah terdaftar!' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    ) as any;

    const newUserId = result.insertId;

    const userPayload = {
      id: newUserId,
      email,
      name
    };

    // Sign JWT token
    const token = signToken(userPayload);

    // Create response
    const response = NextResponse.json({
      message: 'Registrasi berhasil!',
      user: { id: newUserId, name, email }
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
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat registrasi.' },
      { status: 500 }
    );
  }
}
