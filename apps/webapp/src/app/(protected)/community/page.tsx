'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePosts } from './_hooks/use-posts';
import { PlusCircle } from 'lucide-react';
import type { Post } from './_types';
import { CreatePostModal } from './_components/create-post-modal';

export default function CommunityPage() {
  const t = useTranslations('community');
  const { data: posts, isLoading: postsLoading } = usePosts();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('feedDescription')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreatePostModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('createPost')}
          </Button>
        </div>
      </div>

      {/* Posts Feed */}
      {postsLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t('loadingPosts')}
            </p>
          </CardContent>
        </Card>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: Post) => (
            <Card
              key={post.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                {post.excerpt && (
                  <CardDescription className="text-base mt-2">
                    {post.excerpt}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 line-clamp-3">
                  {post.content?.substring(0, 200)}
                  {post.content && post.content.length > 200 ? '...' : ''}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tagRelation => (
                      <span
                        key={tagRelation.tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tagRelation.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('noPosts')}</p>
          </CardContent>
        </Card>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
}
