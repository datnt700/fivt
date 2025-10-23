'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePost } from '../_hooks/use-posts';
import { Loader2, X } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const createPost = useCreatePost();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        status,
      });

      // Reset form
      setTitle('');
      setContent('');
      setExcerpt('');
      setCoverImage('');
      setTags([]);
      setTagInput('');
      setStatus('PUBLISHED');

      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createPost')}</DialogTitle>
          <DialogDescription>{t('post.createDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              {t('post.title')}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('post.titlePlaceholder')}
              required
              maxLength={300}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/300 {tCommon('characters')}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="required">
              {t('post.content')}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t('post.contentPlaceholder')}
              required
              rows={10}
              className="resize-y min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              {t('post.minCharacters', { count: 10 })}
            </p>
          </div>

          {/* Excerpt (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">{t('post.excerpt')}</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder={t('post.excerptPlaceholder')}
              rows={3}
              maxLength={500}
              className="resize-y"
            />
          </div>

          {/* Cover Image (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">{t('post.coverImage')}</Label>
            <Input
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t('post.tags')}</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('post.addTagPlaceholder')}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                {t('post.addTag')}
              </Button>
            </div>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {tags.length}/10 {t('post.tagsCount')}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('post.status')}</Label>
            <Select
              value={status}
              onValueChange={value => setStatus(value as 'DRAFT' | 'PUBLISHED')}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t('post.draft')}</SelectItem>
                <SelectItem value="PUBLISHED">{t('post.published')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createPost.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('post.createPost')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
