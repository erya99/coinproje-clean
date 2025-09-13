'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveRequest(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.coinRequest.update({
    where: { id },
    data: { status: 'APPROVED', reviewedAt: new Date() },
  });

  // sayfayı yenilesin
  revalidatePath('/admin/requests');
}

export async function rejectRequest(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.coinRequest.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date() },
  });

  // sayfayı yenilesin
  revalidatePath('/admin/requests');
}
