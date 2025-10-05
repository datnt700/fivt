'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
export const updateUserProfile = async (data: { name: string }) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
      },
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
};
