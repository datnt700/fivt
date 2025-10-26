import { NextResponse } from 'next/server';
import { createRoadmap } from '@/actions/roadmap';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createRoadmap(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ roadmap: result.roadmap, raw: result.raw });
  } catch (err) {
    console.error('API /roadmap error:', err);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
