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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePosts } from './_hooks/use-posts';
import { MessageSquare, Tag, TrendingUp, PlusCircle } from 'lucide-react';
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
          <p className="text-muted-foreground">
            {t('feed')} • {t('posts')} • {t('tags')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreatePostModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('createPost')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('posts')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.totalPosts')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('tags')}</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.totalTags')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.activity')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.thisWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">{t('feed')}</TabsTrigger>
          <TabsTrigger value="posts">{t('posts')}</TabsTrigger>
          <TabsTrigger value="tags">{t('tags')}</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('feed')}</CardTitle>
              <CardDescription>{t('feedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <p>{t('loadingPosts')}</p>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: Post) => (
                    <div key={post.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {post.excerpt || post.content?.substring(0, 150)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noPosts')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('posts')}</CardTitle>
              <CardDescription>{t('postsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <p>{t('loadingPosts')}</p>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: Post) => (
                    <div key={post.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {post.excerpt || post.content?.substring(0, 150)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noPosts')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tags')}</CardTitle>
              <CardDescription>{t('tagsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('tag.noTags')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
}
