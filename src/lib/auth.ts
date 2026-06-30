import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'motoserv_secure_jwt_secret_token_2026_key_!@#';

export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

export function signToken(payload: UserPayload): string {
  // Token expires in 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): UserPayload | null {
  const tokenCookie = req.cookies.get('token');
  if (!tokenCookie) return null;
  
  return verifyToken(tokenCookie.value);
}
