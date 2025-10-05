import { auth } from '@/auth';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';
import ProfileEditPage from './edit/page';

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/');
  }

  const user = session.user as User;
  console.log(user);
  return (
    <ProfileEditPage
      defaultName={user.name || ''}
      defaultEmail={user.email || ''}
    />
  );
}
