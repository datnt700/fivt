import { ReactNode } from 'react';
import '@/app/globals.css';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en" className="mdl-js" suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
}
