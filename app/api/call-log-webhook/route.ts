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

async function readWebhookBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = req.headers.get('content-type')?.toLowerCase() || '';

  if (contentType.includes('application/json')) {
    return req.json().catch(() => null);
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await req.formData().catch(() => null);
    if (!form) return null;
    return Object.fromEntries(form.entries());
  }

  const text = await req.text().catch(() => '');
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

function normalizePayload(input: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!input || typeof input !== 'object') return null;

  const payload = { ...input };

  if (!payload.timestamp) {
    payload.timestamp = new Date().toISOString();
  }

  if (typeof payload.duration === 'string') {
    const parsed = Number.parseInt(payload.duration, 10);
    if (Number.isFinite(parsed)) payload.duration = parsed;
  }

  return payload;
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

  const body = normalizePayload(await readWebhookBody(req));
  const parsed = callLogWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid payload',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      },
      { status: 400 }
    );
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
