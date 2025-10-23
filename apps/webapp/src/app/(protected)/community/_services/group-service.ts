import {
  createGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
} from '../_actions/group';
import type {
  CreateGroupFormValues,
  UpdateGroupFormValues,
} from '../_validations/group-schema';

/**
 * Service layer for group-related operations
 */

export async function getGroups() {
  const response = await fetch('/api/community/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }
  return response.json();
}

export async function getGroup(slug: string) {
  const response = await fetch(`/api/community/groups/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch group');
  }
  return response.json();
}

export async function createGroupAction(data: CreateGroupFormValues) {
  return createGroup(data);
}

export async function updateGroupAction(
  groupId: string,
  data: UpdateGroupFormValues
) {
  return updateGroup(groupId, data);
}

export async function joinGroupAction(groupId: string) {
  return joinGroup(groupId);
}

export async function leaveGroupAction(groupId: string) {
  return leaveGroup(groupId);
}

export const groupService = {
  getGroups,
  getGroup,
  createGroup: createGroupAction,
  updateGroup: updateGroupAction,
  joinGroup: joinGroupAction,
  leaveGroup: leaveGroupAction,
};
