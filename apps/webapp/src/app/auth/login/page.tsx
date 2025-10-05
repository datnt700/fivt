import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '../_components';
import React from 'react';
import { auth } from '@/auth';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);

  if (session) {
    redirect(`/${locale}`);
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Fivt
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
