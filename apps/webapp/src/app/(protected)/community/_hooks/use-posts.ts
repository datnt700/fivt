import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { postService } from '../_services/post-service';
import type {
  CreatePostFormValues,
  UpdatePostFormValues,
} from '../_validations/post-schema';

export function usePosts(params?: {
  groupId?: string;
  userId?: string;
  status?: string;
}) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['posts', locale, params],
    queryFn: () => postService.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePost(slug: string, groupSlug?: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['post', locale, slug, groupSlug],
    queryFn: () => postService.getPost(slug, groupSlug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostFormValues) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', locale] });
    },
  });
}

export function useUpdatePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: UpdatePostFormValues;
    }) => postService.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', locale] });
      queryClient.invalidateQueries({ queryKey: ['post', locale] });
    },
  });
}

export function useDeletePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', locale] });
    },
  });
}

export function useVotePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      voteType,
    }: {
      postId: string;
      voteType: 'UPVOTE' | 'DOWNVOTE';
    }) => postService.votePost(postId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', locale] });
      queryClient.invalidateQueries({ queryKey: ['posts', locale] });
    },
  });
}
