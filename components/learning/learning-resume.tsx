'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { learningLessons } from '@/lib/learning/lessons';
import {
  LEARNING_PROGRESS_EVENT,
  LEARNING_PROGRESS_KEY,
  loadLearningProgress,
  type LearningProgress,
} from '@/lib/learning/progress';

export function LearningResume({ controls = false }: { controls?: boolean }) {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const read = () => {
      try {
        setProgress(loadLearningProgress());
      } catch {
        setMessage('Local progress is unavailable. You can still read every lesson.');
      }
    };
    read();
    window.addEventListener('storage', read);
    window.addEventListener(LEARNING_PROGRESS_EVENT, read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener(LEARNING_PROGRESS_EVENT, read);
    };
  }, []);
  const last = learningLessons.find((lesson) => lesson.id === progress?.lastLessonId);
  const completed = Object.values(progress?.lessons ?? {}).filter(
    (entry) => entry.completed,
  ).length;
  const download = () => {
    try {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(loadLearningProgress(), null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'openmaic-learning-progress.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage('Progress could not be exported. Your current lesson remains available.');
    }
  };
  return (
    <section aria-label="Your local learning progress" className="mt-4 space-y-3 text-base">
      {last && (
        <Link
          className="inline-block rounded-lg border px-3 py-2 font-semibold underline"
          href={`/learn/${last.id}`}
        >
          Continue learning: {last.title}
        </Link>
      )}
      {controls && (
        <>
          <p>
            {completed} of {learningLessons.length} lessons marked complete on this device.
            Completion is a learning record, not a financial qualification.
          </p>
          <p className="text-sm">
            Progress stays in this browser on this device. It does not sync to an account. You can
            optionally remember quiz answers within each lesson.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg border px-3 py-2" onClick={download}>
              Export local progress
            </button>
            <button
              className="rounded-lg border px-3 py-2"
              onClick={() => {
                if (
                  !window.confirm(
                    'Reset only the built-in learning progress and remembered answers on this device?',
                  )
                )
                  return;
                try {
                  localStorage.removeItem(LEARNING_PROGRESS_KEY);
                  setProgress(loadLearningProgress());
                  window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT));
                  setMessage('Learning progress reset.');
                } catch {
                  setMessage('Progress could not be reset.');
                }
              }}
            >
              Reset local progress
            </button>
          </div>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
