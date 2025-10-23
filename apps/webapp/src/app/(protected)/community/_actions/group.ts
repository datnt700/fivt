'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createGroupSchema,
  updateGroupSchema,
} from '@/app/(protected)/(dashboard)/community/_validations/group-schema';
import { revalidatePath } from 'next/cache';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export async function createGroup(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = createGroupSchema.parse(data);
    const userId = session.user.id;

    // Generate unique slug
    const baseSlug = generateSlug(validated.name);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.group.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create group and add creator as member and moderator
    const group = await prisma.group.create({
      data: {
        name: validated.name,
        slug,
        description: validated.description,
        icon: validated.icon || null,
        banner: validated.banner || null,
        isPrivate: validated.isPrivate,
        members: {
          create: { userId },
        },
        moderators: {
          create: { userId },
        },
      },
      include: {
        _count: { select: { members: true, posts: true } },
      },
    });

    revalidatePath('/community/groups');

    return { success: true, data: group };
  } catch (error) {
    console.error('Error creating group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create group',
    };
  }
}

export async function updateGroup(groupId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updateGroupSchema.parse(data);
    const userId = session.user.id;

    // Verify user is a moderator
    const isModerator = await prisma.groupModerator.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!isModerator) {
      return {
        success: false,
        error: 'Forbidden: Only moderators can update the group',
      };
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...validated,
        icon: validated.icon === '' ? null : validated.icon,
        banner: validated.banner === '' ? null : validated.banner,
      },
      include: {
        _count: { select: { members: true, posts: true } },
      },
    });

    revalidatePath('/community/groups');
    revalidatePath(`/community/groups/${group.slug}`);

    return { success: true, data: group };
  } catch (error) {
    console.error('Error updating group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update group',
    };
  }
}

export async function joinGroup(groupId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Check if group exists
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (existingMember) {
      return { success: false, error: 'Already a member of this group' };
    }

    await prisma.groupMember.create({
      data: { userId, groupId },
    });

    revalidatePath(`/community/groups/${group.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error joining group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join group',
    };
  }
}

export async function leaveGroup(groupId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Check if member exists
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!member) {
      return { success: false, error: 'Not a member of this group' };
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });

    // Remove membership and moderator status if applicable
    await prisma.$transaction([
      prisma.groupMember.delete({
        where: { id: member.id },
      }),
      prisma.groupModerator.deleteMany({
        where: { userId, groupId },
      }),
    ]);

    if (group) {
      revalidatePath(`/community/groups/${group.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error leaving group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to leave group',
    };
  }
}
