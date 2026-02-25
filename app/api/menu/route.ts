import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validators';
import { sanitizePlainText } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.menuItem.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid menu item payload' }, { status: 400 });

  const data = parsed.data;
  const item = await prisma.menuItem.create({
    data: {
      name: sanitizePlainText(data.name),
      category: sanitizePlainText(data.category),
      description: sanitizePlainText(data.description),
      price: data.price,
      imageUrl: data.imageUrl || null,
      available: data.available
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}
