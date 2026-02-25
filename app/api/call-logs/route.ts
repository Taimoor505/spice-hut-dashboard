import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status');
  const direction = searchParams.get('direction');

  const logs = await prisma.callLog.findMany({
    where: {
      phone: q ? { contains: q, mode: 'insensitive' } : undefined,
      status: status ? (status as 'COMPLETED' | 'MISSED' | 'FAILED') : undefined,
      direction: direction ? (direction as 'INBOUND' | 'OUTBOUND') : undefined
    },
    orderBy: { timestamp: 'desc' },
    take: 500
  });

  return NextResponse.json({ logs });
}
