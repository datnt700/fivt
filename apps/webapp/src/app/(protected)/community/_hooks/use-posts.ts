import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { postService } from '../_services/post-service';
import type {
  CreatePostFormValues,
  UpdatePostFormValues,
} from '../_validations/post-schema';

export function usePosts(params?: { userId?: string; status?: string }) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['posts', locale, params],
    queryFn: () => postService.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePost(slug: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['post', locale, slug],
    queryFn: () => postService.getPost(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostFormValues) => postService.createPost(data),
    onSuccess: () => {
      // Invalidate all posts queries regardless of params
      queryClient.invalidateQueries({
        queryKey: ['posts', locale],
        exact: false,
      });
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
      queryClient.invalidateQueries({
        queryKey: ['posts', locale],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['post', locale],
        exact: false,
      });
    },
  });
}

export function useDeletePost() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', locale],
        exact: false,
      });
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
      queryClient.invalidateQueries({
        queryKey: ['post', locale],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['posts', locale],
        exact: false,
      });
    },
  });
}
