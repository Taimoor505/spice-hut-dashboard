import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-ai-menu-token');
  if (!token || token !== process.env.AI_MENU_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });

  return NextResponse.json({
    restaurant_name: 'Spice Hut',
    menu: items.map((item) => ({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price.toString(),
      available: item.available
    }))
  });
}
