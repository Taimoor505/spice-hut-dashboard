import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await prisma.callLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 2000
  });

  const header = [
    'customer_name',
    'phone',
    'direction',
    'status',
    'duration',
    'timestamp',
    'recording_url',
    'transcription',
    'order_summary',
    'ai_confidence'
  ];

  const lines = [header.join(',')].concat(
    logs.map((log) =>
      [
        escapeCsv(log.customerName),
        escapeCsv(log.phone),
        escapeCsv(log.direction),
        escapeCsv(log.status),
        escapeCsv(log.duration),
        escapeCsv(log.timestamp.toISOString()),
        escapeCsv(log.recordingUrl),
        escapeCsv(log.transcription),
        escapeCsv(log.orderSummary),
        escapeCsv(log.aiConfidence)
      ].join(',')
    )
  );

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="spice-hut-call-logs.csv"'
    }
  });
}
