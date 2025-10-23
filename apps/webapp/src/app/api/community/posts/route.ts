import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma, PostStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'PUBLISHED';

    const where: Prisma.PostWhereInput = { status: status as PostStatus };

    if (groupId) {
      where.groupId = groupId;
    }

    if (userId) {
      where.userId = userId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        group: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { createPost } = await import(
      '@/app/(protected)/community/_actions/post'
    );
    const result = await createPost(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
