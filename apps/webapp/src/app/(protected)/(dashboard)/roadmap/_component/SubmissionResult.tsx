'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFinancialRoadmapSteps } from '../_data';

type RoadmapShape = {
  title?: string;
  summary?: string;
  steps?: Array<{
    title?: string;
    description?: string;
    actionItems?: string[];
    expectedWeeks?: number;
  }>;
};

type SubmitResult = {
  roadmap?: RoadmapShape;
  raw?: string;
  error?: string;
};

interface SubmissionResultProps {
  data: SubmitResult;
}

export default function SubmissionResult({ data }: SubmissionResultProps) {
  const { roadmap, raw, error } = data;

  if (!roadmap && !raw && !error) return null;

  return (
    <div className="mt-6 p-4 border rounded">
      {error && <div className="text-red-600">{error}</div>}
      {roadmap ? (
        <div>
          <h3 className="font-semibold">{roadmap.title}</h3>
          <p className="text-sm mb-2">{roadmap.summary}</p>
          <ol className="list-decimal pl-5">
            {roadmap.steps?.map((s, i: number) => (
              <li key={i} className="mb-2">
                <strong>{s.title}</strong>
                <p>{s.description}</p>
                {s.actionItems?.length ? (
                  <ul className="list-disc pl-5">
                    {s.actionItems.map((a: string, j: number) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap">{raw}</pre>
      )}
    </div>
  );
}
