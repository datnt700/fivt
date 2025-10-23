import { createPost, updatePost, deletePost, votePost } from '../_actions/post';
import type {
  CreatePostFormValues,
  UpdatePostFormValues,
} from '../_validations/post-schema';

/**
 * Service layer for post-related operations
 */

export async function getPosts(params?: { userId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.userId) query.append('userId', params.userId);
  if (params?.status) query.append('status', params.status);

  const response = await fetch(`/api/community/posts?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export async function getPost(slug: string) {
  const response = await fetch(`/api/community/posts/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
}

export async function createPostAction(data: CreatePostFormValues) {
  return createPost(data);
}

export async function updatePostAction(
  postId: string,
  data: UpdatePostFormValues
) {
  return updatePost(postId, data);
}

export async function deletePostAction(postId: string) {
  return deletePost(postId);
}

export async function votePostAction(
  postId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
) {
  return votePost(postId, voteType);
}

export const postService = {
  getPosts,
  getPost,
  createPost: createPostAction,
  updatePost: updatePostAction,
  deletePost: deletePostAction,
  votePost: votePostAction,
};
