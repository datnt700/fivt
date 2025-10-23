'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createPostSchema,
  updatePostSchema,
} from '../_validations/post-schema';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export async function createPost(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validationResult = createPostSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map(err => err.message)
        .join(', ');
      return { success: false, error: errorMessages };
    }

    const validated = validationResult.data;
    const userId = session.user.id;

    // Generate slug
    const baseSlug = generateSlug(validated.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (
      await prisma.post.findFirst({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title: validated.title,
        slug,
        content: validated.content,
        excerpt: validated.excerpt,
        coverImage: validated.coverImage || null,
        status: validated.status,
        userId,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
        tags: validated.tags
          ? {
              create: await Promise.all(
                validated.tags.map(async tagName => {
                  const tagSlug = generateSlug(tagName);
                  let tag = await prisma.tag.findUnique({
                    where: { slug: tagSlug },
                  });

                  if (!tag) {
                    tag = await prisma.tag.create({
                      data: { name: tagName, slug: tagSlug },
                    });
                  }

                  return { tagId: tag.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
    });

    revalidatePath('/community');

    return { success: true, data: post };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create post',
    };
  }
}

export async function updatePost(postId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updatePostSchema.parse(data);
    const userId = session.user.id;

    // Verify post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: 'Post not found' };
    }

    if (existingPost.userId !== userId) {
      return { success: false, error: 'Forbidden' };
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        ...validated,
        coverImage: validated.coverImage === '' ? null : validated.coverImage,
        publishedAt:
          validated.status === 'PUBLISHED' && !existingPost.publishedAt
            ? new Date()
            : existingPost.publishedAt,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        group: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
    });

    revalidatePath('/community');
    revalidatePath(`/community/posts/${post.slug}`);

    return { success: true, data: post };
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update post',
    };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Verify post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: 'Post not found' };
    }

    if (existingPost.userId !== userId) {
      return { success: false, error: 'Forbidden' };
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'DELETED' },
    });

    revalidatePath('/community');

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete post',
    };
  }
}

export async function votePost(
  postId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Check existing vote
    const existingVote = await prisma.postVote.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await prisma.postVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote type
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
      }
    } else {
      // Create new vote
      await prisma.postVote.create({
        data: { userId, postId, voteType },
      });
    }

    revalidatePath(`/community/posts/${post.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error voting on post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote',
    };
  }
}
