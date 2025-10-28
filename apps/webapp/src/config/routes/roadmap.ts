export const ROADMAP_ROUTES = {
  INDEX: '/roadmap',
} as const;

export const isRoadmapRoute = (pathname: string): boolean => {
  return pathname.startsWith('/roadmap');
};

export const isRoadmapApiRoute = (pathname: string): boolean => {
  return pathname.startsWith('/api/roadmap');
};
