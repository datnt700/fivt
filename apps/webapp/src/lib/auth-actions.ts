'use server';

import { signIn } from '../auth';

export async function signInWithGoogle(locale: string = 'en') {
  await signIn('google', { 
    redirectTo: `/${locale}` 
  });
}