import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Next 13/14: Edge değil Node runtime gerekiyor
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const filename = `${randomUUID()}.${ext}`;

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), bytes);

  // Tarayıcıdan erişilecek yol
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
