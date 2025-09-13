'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function rejectRequest(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return;

  // kayıt varsa sil; yoksa sessiz geç
  try {
    await prisma.coinRequest.delete({ where: { id } });
  } catch (_) {}

  // listeyi tazele
  revalidatePath('/admin/request');
}
