import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/jwt';

const protectedPrefixes = ['/overview', '/call-logs', '/menu', '/ai-settings'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('spice_hut_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('spice_hut_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/overview/:path*', '/call-logs/:path*', '/menu/:path*', '/ai-settings/:path*']
};
