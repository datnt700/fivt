import {
  createComment,
  updateComment,
  deleteComment,
  voteComment,
} from '../_actions/comment';
import type {
  CreateCommentFormValues,
  UpdateCommentFormValues,
} from '../_validations/comment-schema';

/**
 * Service layer for comment-related operations
 */

export async function getComments(postId: string) {
  const response = await fetch(`/api/community/posts/${postId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
}

export async function createCommentAction(data: CreateCommentFormValues) {
  return createComment(data);
}

export async function updateCommentAction(
  commentId: string,
  data: UpdateCommentFormValues
) {
  return updateComment(commentId, data);
}

export async function deleteCommentAction(commentId: string) {
  return deleteComment(commentId);
}

export async function voteCommentAction(
  commentId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
) {
  return voteComment(commentId, voteType);
}

export const commentService = {
  getComments,
  createComment: createCommentAction,
  updateComment: updateCommentAction,
  deleteComment: deleteCommentAction,
  voteComment: voteCommentAction,
};
