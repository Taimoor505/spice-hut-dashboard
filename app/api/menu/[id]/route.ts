import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validators';
import { sanitizePlainText } from '@/lib/sanitize';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const data = parsed.data;
  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name ? sanitizePlainText(data.name) : undefined,
      category: data.category ? sanitizePlainText(data.category) : undefined,
      description: data.description ? sanitizePlainText(data.description) : undefined,
      price: data.price,
      imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl || null,
      available: data.available
    }
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
