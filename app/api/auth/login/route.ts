import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword } from '@/lib/password';
import { loginSchema } from '@/lib/validators';
import { signAuthToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  const token = await signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });

  const response = NextResponse.json({ success: true });
  response.cookies.set('spice_hut_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/'
  });

  return response;
}
