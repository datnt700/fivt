'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import { auth } from '@/auth';

// Minimal input schema: an array of answers (questionId optional) and optional locale
const RoadmapInputSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().optional(),
        answer: z.string(),
      })
    )
    .min(1),
  locale: z.string().optional(),
});

type RoadmapInput = z.infer<typeof RoadmapInputSchema>;

// Result shape used by callers
export type RoadmapResult =
  | { success: true; roadmap: unknown; raw?: string }
  | { success: false; error: string };

// Lazily create OpenAI client to avoid build-time failures
function getOpenAIClient(): OpenAI {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    (process.env.NODE_ENV === 'test' ? 'test-openai-key' : undefined);
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey });
}

/**
 * Create a structured financial roadmap from a set of answers using OpenAI.
 * - Validates input
 * - Optionally authenticates user (non-blocking)
 * - Calls OpenAI and returns structured JSON when possible
 */
export async function createRoadmap(
  input: RoadmapInput
): Promise<RoadmapResult> {
  try {
    const parsed = RoadmapInputSchema.parse(input);

    // Attempt to authenticate (non-blocking). Follow project pattern: auth() returns a session or throws
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null; // anonymous
    }
    const userId = session?.user?.id;

    // Build a concise prompt instructing the model to return JSON
    const locale = parsed.locale || 'en';
    const answersBullet = parsed.answers
      .map(a => `- ${a.questionId ? `${a.questionId}: ` : ''}${a.answer}`)
      .join('\n');

    const instruction = `You are a professional personal finance planner. Based on the user's answers below, produce a concise, structured financial roadmap. Return output as JSON only, with the following shape:
{
  "title": string,
  "summary": string,
  "steps": [
    {"title": string, "description": string, "actionItems": [string], "expectedWeeks": number}
  ]
}

Guidelines:
- Keep total steps between 3 and 7.
- Each step must include 1-3 concrete action items the user can do immediately.
- Use short sentences and simple language in the requested locale (${locale}).
- If some answers are missing, infer reasonable defaults but mark assumptions in the summary.

User answers:\n${answersBullet}
User ID: ${userId ?? 'anonymous'}

Only output valid JSON (no additional commentary).`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo', 
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that returns structured JSON when requested. Do not add any commentary outside the JSON.',
        },
        { role: 'user', content: instruction },
      ],
      max_tokens: 800,
      stream: false,
    });

    const text =
      response.choices?.[0]?.message?.content?.trim?.() ??
      (typeof response === 'string' ? response : '');

    if (!text) {
      return { success: false, error: 'Empty response from OpenAI' };
    }

    // Try to parse JSON. Models can sometimes include code fences — strip them if present
    const cleaned = text.replace(/^```\w*\n?|\n?```$/g, '').trim();
    try {
      const parsedJson = JSON.parse(cleaned);
      return { success: true, roadmap: parsedJson, raw: cleaned };
    } catch {
      // If JSON parsing fails, return raw text so the client can surface it and we can improve prompts
      return { success: true, roadmap: null, raw: cleaned };
    }
  } catch (err: unknown) {
    console.error('createRoadmap error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message ?? 'Unknown error' };
  }
}
