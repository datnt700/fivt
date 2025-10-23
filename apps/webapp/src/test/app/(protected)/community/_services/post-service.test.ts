import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postService } from '@/app/(protected)/community/_services/post-service';
import * as postActions from '@/app/(protected)/community/_actions/post';

// Mock the server actions
vi.mock('@/app/(protected)/community/_actions/post', () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  votePost: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('Post Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch posts successfully without filters', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post 1',
          slug: 'test-post-1',
          content: 'Content 1',
        },
        {
          id: 'post-2',
          title: 'Test Post 2',
          slug: 'test-post-2',
          content: 'Content 2',
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockPosts,
      } as Response);

      const result = await postService.getPosts();

      expect(global.fetch).toHaveBeenCalledWith('/api/community/posts?');
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with groupId filter', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Group Post',
          slug: 'group-post',
          groupId: 'group-123',
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockPosts,
      } as Response);

      const result = await postService.getPosts({ groupId: 'group-123' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts?groupId=group-123'
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with userId filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await postService.getPosts({ userId: 'user-456' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts?userId=user-456'
      );
    });

    it('should fetch posts with status filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await postService.getPosts({ status: 'PUBLISHED' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts?status=PUBLISHED'
      );
    });

    it('should fetch posts with multiple filters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await postService.getPosts({
        groupId: 'group-123',
        userId: 'user-456',
        status: 'DRAFT',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts?groupId=group-123&userId=user-456&status=DRAFT'
      );
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      } as Response);

      await expect(postService.getPosts()).rejects.toThrow(
        'Failed to fetch posts'
      );
    });
  });

  describe('getPost', () => {
    it('should fetch a single post by slug', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Test Post',
        slug: 'test-post',
        content: 'Post content',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockPost,
      } as Response);

      const result = await postService.getPost('test-post');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts/test-post'
      );
      expect(result).toEqual(mockPost);
    });

    it('should fetch a post with groupSlug filter', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Group Post',
        slug: 'group-post',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockPost,
      } as Response);

      const result = await postService.getPost('group-post', 'my-group');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/community/posts/group-post?groupSlug=my-group'
      );
      expect(result).toEqual(mockPost);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      } as Response);

      await expect(postService.getPost('test-post')).rejects.toThrow(
        'Failed to fetch post'
      );
    });
  });

  describe('createPost', () => {
    it('should call createPost action successfully', async () => {
      const postData = {
        title: 'New Post',
        content: 'New post content',
      };

      const mockResponse = {
        success: true,
        data: { id: 'new-post-1', ...postData },
      };

      vi.mocked(postActions.createPost).mockResolvedValue(
        mockResponse as unknown as ReturnType<typeof postActions.createPost>
      );

      const result = await postService.createPost(postData);

      expect(postActions.createPost).toHaveBeenCalledWith(postData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle createPost action failure', async () => {
      const postData = {
        title: 'New Post',
        content: 'New post content',
      };

      const mockError = {
        success: false,
        error: 'Failed to create post',
      };

      vi.mocked(postActions.createPost).mockResolvedValue(
        mockError as unknown as ReturnType<typeof postActions.createPost>
      );

      const result = await postService.createPost(postData);

      expect(result).toEqual(mockError);
    });
  });

  describe('updatePost', () => {
    it('should call updatePost action successfully', async () => {
      const postId = 'post-123';
      const updateData = {
        title: 'Updated Title',
      };

      const mockResponse = {
        success: true,
        data: { id: postId, ...updateData },
      };

      vi.mocked(postActions.updatePost).mockResolvedValue(
        mockResponse as unknown as ReturnType<typeof postActions.updatePost>
      );

      const result = await postService.updatePost(postId, updateData);

      expect(postActions.updatePost).toHaveBeenCalledWith(postId, updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deletePost', () => {
    it('should call deletePost action successfully', async () => {
      const postId = 'post-123';
      const mockResponse = { success: true };

      vi.mocked(postActions.deletePost).mockResolvedValue(
        mockResponse as unknown as ReturnType<typeof postActions.deletePost>
      );

      const result = await postService.deletePost(postId);

      expect(postActions.deletePost).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('votePost', () => {
    it('should call votePost action with UPVOTE', async () => {
      const postId = 'post-123';
      const mockResponse = { success: true };

      vi.mocked(postActions.votePost).mockResolvedValue(
        mockResponse as unknown as ReturnType<typeof postActions.votePost>
      );

      const result = await postService.votePost(postId, 'UPVOTE');

      expect(postActions.votePost).toHaveBeenCalledWith(postId, 'UPVOTE');
      expect(result).toEqual(mockResponse);
    });

    it('should call votePost action with DOWNVOTE', async () => {
      const postId = 'post-123';
      const mockResponse = { success: true };

      vi.mocked(postActions.votePost).mockResolvedValue(
        mockResponse as unknown as ReturnType<typeof postActions.votePost>
      );

      const result = await postService.votePost(postId, 'DOWNVOTE');

      expect(postActions.votePost).toHaveBeenCalledWith(postId, 'DOWNVOTE');
      expect(result).toEqual(mockResponse);
    });
  });
});
