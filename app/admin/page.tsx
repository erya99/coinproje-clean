import React from 'react';
import { redirect } from 'next/navigation';

// (opsiyonel) bu sayfa hep dinamik olsun
export const dynamic = 'force-dynamic';

export default function AdminRootPage() {
  // /admin -> /admin/coins
  redirect('/admin/coins');
  // redirect bir exception fırlatır; aşağıdaki return sadece TS’yi susturmak için
  return null;
}
