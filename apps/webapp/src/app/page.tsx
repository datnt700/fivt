import { redirect } from 'next/navigation';

export default async function RootIndex() {
  redirect('/dashboard');
}
