import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootIndex() {
  const locale = (await cookies()).get('NEXT_LOCALE')?.value ?? 'en';
  redirect(`/${locale}`);
}
