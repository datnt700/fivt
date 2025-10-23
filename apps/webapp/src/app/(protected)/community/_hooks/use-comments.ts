import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { commentService } from '../_services/comment-service';
import type {
  CreateCommentFormValues,
  UpdateCommentFormValues,
} from '../_validations/comment-schema';

export function useComments(postId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['comments', locale, postId],
    queryFn: () => commentService.getComments(postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateComment() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentFormValues) =>
      commentService.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', locale, variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ['post', locale] });
    },
  });
}

export function useUpdateComment() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentFormValues;
    }) => commentService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', locale] });
    },
  });
}

export function useDeleteComment() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', locale] });
    },
  });
}

export function useVoteComment() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      voteType,
    }: {
      commentId: string;
      voteType: 'UPVOTE' | 'DOWNVOTE';
    }) => commentService.voteComment(commentId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', locale] });
    },
  });
}
