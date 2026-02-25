import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';
import { signAuthToken } from '@/lib/jwt';
import { sanitizePlainText } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid signup payload' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const name = sanitizePlainText(parsed.data.name);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'MANAGER'
    }
  });

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });

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
