import { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/jwt';

export const AUTH_COOKIE = 'spice_hut_token';

export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}
