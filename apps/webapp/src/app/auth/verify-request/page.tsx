// src/app/auth/verify-request/page.tsx
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const locale = await getLocale();
  redirect(`/${locale}/auth/verify-request`);
}
