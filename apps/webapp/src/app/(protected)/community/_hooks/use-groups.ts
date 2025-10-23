import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { groupService } from '../_services/group-service';
import type {
  CreateGroupFormValues,
  UpdateGroupFormValues,
} from '../_validations/group-schema';

export function useGroups() {
  const locale = useLocale();

  return useQuery({
    queryKey: ['groups', locale],
    queryFn: () => groupService.getGroups(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGroup(slug: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ['group', locale, slug],
    queryFn: () => groupService.getGroup(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGroup() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupFormValues) => groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', locale] });
    },
  });
}

export function useUpdateGroup() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateGroupFormValues;
    }) => groupService.updateGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', locale] });
      queryClient.invalidateQueries({ queryKey: ['group', locale] });
    },
  });
}

export function useJoinGroup() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', locale] });
      queryClient.invalidateQueries({ queryKey: ['groups', locale] });
    },
  });
}

export function useLeaveGroup() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', locale] });
      queryClient.invalidateQueries({ queryKey: ['groups', locale] });
    },
  });
}
