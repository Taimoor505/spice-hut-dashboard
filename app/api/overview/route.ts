import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

function extractRevenue(summary: string | null): number {
  if (!summary) return 0;
  const moneyMatches = summary.match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/g) || [];
  if (moneyMatches.length === 0) return 0;
  return Number(moneyMatches[moneyMatches.length - 1].replace('$', '')) || 0;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [callsToday, ordersToday, menuItems, unavailableItems] = await Promise.all([
    prisma.callLog.findMany({ where: { timestamp: { gte: todayStart } } }),
    prisma.callLog.findMany({ where: { timestamp: { gte: todayStart }, orderSummary: { not: null } } }),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.menuItem.count({ where: { available: false } })
  ]);

  const revenue = ordersToday.reduce((sum, call) => sum + extractRevenue(call.orderSummary), 0);

  const frequency = new Map<string, number>();
  for (const call of ordersToday) {
    if (!call.orderSummary) continue;
    const parts = call.orderSummary.split(',').map((p) => p.trim());
    for (const part of parts) {
      if (!part || part.startsWith('$')) continue;
      frequency.set(part, (frequency.get(part) || 0) + 1);
    }
  }

  let mostOrderedItem = 'N/A';
  let topCount = 0;
  for (const [item, count] of frequency) {
    if (count > topCount) {
      topCount = count;
      mostOrderedItem = item;
    }
  }

  return NextResponse.json({
    totalCallsToday: callsToday.length,
    totalOrdersToday: ordersToday.length,
    revenue,
    mostOrderedItem,
    activeMenuItemsCount: menuItems,
    unavailableItemsCount: unavailableItems
  });
}
