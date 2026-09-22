'use client';

import { useState } from 'react';
import { useStageStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ContentReviewPanel } from './content-review-panel';
import { classroomReviewContent } from '@/lib/learning/classroom-review';
import { safeSourceUrl } from '@/lib/learning/review';

export function ClassroomReviewButton() {
  const [open, setOpen] = useState(false);
  const stage = useStageStore((state) => state.stage);
  const scenes = useStageStore((state) => state.scenes);
  if (!stage) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="min-h-9 rounded-lg border px-3 py-2 text-sm font-semibold">
          Sources &amp; review
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl">
        <DialogTitle>Sources and review: {stage.name}</DialogTitle>
        <DialogDescription>
          Review the current classroom content. Source retrieval and editorial approval are separate
          checks.
        </DialogDescription>
        {stage.education ? (
          <div className="space-y-3 text-base">
            <p>
              Generated {stage.education.generatedAt}. Search material retrieved{' '}
              {stage.education.retrievedAt || 'date not recorded'}.
            </p>
            <ul className="list-disc pl-5">
              {stage.education.sources
                .filter((s) => safeSourceUrl(s.url))
                .map((source, i) => (
                  <li key={`${source.url}-${i}`}>
                    <a
                      className="break-words underline"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title || source.url}
                    </a>
                  </li>
                ))}
            </ul>
            <details>
              <summary className="cursor-pointer underline">Retrieved research context</summary>
              <p className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">
                {stage.education.researchContext}
              </p>
            </details>
          </div>
        ) : (
          <p>
            No retrieved evidence set is attached to this classroom. Add actual supporting sources
            in the review record.
          </p>
        )}
        {open && (
          <ContentReviewPanel
            recordId={`classroom:${stage.id}`}
            title={stage.name}
            content={classroomReviewContent(stage, scenes)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
