import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const mimeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  if (!mimeOk) return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const outputPath = path.join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(outputPath, buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
