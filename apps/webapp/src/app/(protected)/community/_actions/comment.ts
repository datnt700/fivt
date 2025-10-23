'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createCommentSchema,
  updateCommentSchema,
} from '../_validations/comment-schema';
import { revalidatePath } from 'next/cache';

export async function createComment(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = createCommentSchema.parse(data);
    const userId = session.user.id;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: validated.postId },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Check if post is locked
    if (post.isLocked) {
      return { success: false, error: 'Post is locked for commenting' };
    }

    // Verify parent comment exists if provided
    if (validated.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validated.parentId },
      });

      if (!parentComment || parentComment.postId !== validated.postId) {
        return { success: false, error: 'Parent comment not found' };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        postId: validated.postId,
        userId,
        parentId: validated.parentId || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { replies: true, votes: true } },
      },
    });

    revalidatePath(`/community/posts/${post.slug}`);

    return { success: true, data: comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create comment',
    };
  }
}

export async function updateComment(commentId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updateCommentSchema.parse(data);
    const userId = session.user.id;

    // Verify comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!existingComment) {
      return { success: false, error: 'Comment not found' };
    }

    if (existingComment.userId !== userId) {
      return { success: false, error: 'Forbidden' };
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: validated.content },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { replies: true, votes: true } },
      },
    });

    revalidatePath(`/community/posts/${existingComment.post.slug}`);

    return { success: true, data: comment };
  } catch (error) {
    console.error('Error updating comment:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update comment',
    };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Verify comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!existingComment) {
      return { success: false, error: 'Comment not found' };
    }

    if (existingComment.userId !== userId) {
      return { success: false, error: 'Forbidden' };
    }

    // Soft delete - keep for thread continuity
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: '[deleted]',
      },
    });

    revalidatePath(`/community/posts/${existingComment.post.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete comment',
    };
  }
}

export async function voteComment(
  commentId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Check existing vote
    const existingVote = await prisma.commentVote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await prisma.commentVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote type
        await prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
      }
    } else {
      // Create new vote
      await prisma.commentVote.create({
        data: { userId, commentId, voteType },
      });
    }

    revalidatePath(`/community/posts/${comment.post.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error voting on comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote',
    };
  }
}
