import type { PostStatus, VoteType } from '@prisma/client';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status: PostStatus;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  userId: string;
  groupId?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  group?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count?: {
    comments: number;
    votes: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
    votes: number;
  };
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  banner?: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    members: number;
    posts: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  createdAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  voteType: VoteType;
  createdAt: Date;
}
