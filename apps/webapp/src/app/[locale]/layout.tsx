import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import Providers from "@/app/[locale]/providers";
import "../globals.css";
import { auth } from "@/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/app-sidebar";
import ThemeToggler from "@/components/theme-toggler";
import BottomNav from "@/components/bottom-nav";

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Financial AI - Your Intelligent Financial Companion",
  description: "Get personalized financial advice and strategies powered by AI",
};

const locales = ['en', 'vi', 'fr'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const session = await auth();
  if (!session || !session.user) {
    return redirect('/auth/login');
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SidebarProvider>
              <AdminSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap  w-full">
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <h3 className="text-xl font-medium">FIVT</h3>
                    </div>
                    <div className="mr-4">
                      <ThemeToggler />
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
                    {children}
                  </div>
                </div>
              </SidebarInset>
              <BottomNav/>
            </SidebarProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
