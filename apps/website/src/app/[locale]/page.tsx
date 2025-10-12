'use client';

import { Introduction } from './_components/Introduction';
import Footer from './_components/Footer';
import { Features } from './_components/Features';
import { Header } from './_components/Header';
import { Pricing } from './_components/Pricing';
import { Contact } from './_components/Contact';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  return (
    <>
      <Header />
      <Introduction />
      <Features />
      <Contact />
      <Pricing />
      <Footer />
    </>
  );
}
