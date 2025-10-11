'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ExtensionSkeletonProps {
  count?: number;
}

export function ExtensionSkeleton({ count = 3 }: ExtensionSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/6"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExtensionCardSkeleton({ count = 6 }: ExtensionSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-48">
          <CardHeader className="pb-3">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
