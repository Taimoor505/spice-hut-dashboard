import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { callLogWebhookSchema } from '@/lib/validators';
import { sanitizePlainText } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

function mapStatus(value: string): 'COMPLETED' | 'MISSED' | 'FAILED' {
  const v = value.toLowerCase();
  if (v.includes('miss')) return 'MISSED';
  if (v.includes('fail')) return 'FAILED';
  return 'COMPLETED';
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(`webhook:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = callLogWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const data = parsed.data;

  await prisma.callLog.create({
    data: {
      customerName: sanitizePlainText(data.customer_name),
      phone: sanitizePlainText(data.phone),
      direction: data.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND',
      status: mapStatus(data.status),
      duration: data.duration,
      timestamp: new Date(data.timestamp),
      recordingUrl: data.recording_url || null,
      transcription: sanitizePlainText(data.transcription),
      orderSummary: data.order_summary ? sanitizePlainText(data.order_summary) : null,
      aiConfidence: typeof data.ai_confidence === 'number' ? data.ai_confidence : null
    }
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
