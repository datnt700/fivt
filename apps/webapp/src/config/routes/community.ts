/**
 * Community module routes
 * All routes related to community features (posts, comments, tags)
 */

export const COMMUNITY_ROUTES = {
  // Main community routes
  INDEX: '/community',
  FEED: '/community/feed',

  // Post routes
  POSTS: '/community/posts',
  POST_DETAIL: '/community/posts/[slug]',
  CREATE_POST: '/community/posts/create',
  EDIT_POST: '/community/posts/[slug]/edit',

  // User routes
  USER_POSTS: '/community/users/[userId]/posts',
  USER_COMMENTS: '/community/users/[userId]/comments',

  // API routes
  API: {
    POSTS: '/api/community/posts',
    POST_DETAIL: '/api/community/posts/[slug]',
    POST_COMMENTS: '/api/community/posts/[postId]/comments',
    TAGS: '/api/community/tags',
  },
} as const;

/**
 * Helper functions for community routes
 */

export function getPostDetailRoute(slug: string): string {
  return `/community/posts/${slug}`;
}

export function getUserPostsRoute(userId: string): string {
  return `/community/users/${userId}/posts`;
}

/**
 * Check if a route is a community route
 */
export function isCommunityRoute(pathname: string): boolean {
  return pathname.startsWith('/community');
}

/**
 * Check if a route is a community API route
 */
export function isCommunityApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/community');
}
