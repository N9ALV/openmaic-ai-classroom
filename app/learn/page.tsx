import type { Metadata } from 'next';
import Link from 'next/link';
import { PracticeLab } from '@/components/learning/practice-lab';
import { LearningResume } from '@/components/learning/learning-resume';
import { Glossary } from '@/components/learning/glossary';
import { learningLessons, LEARNING_EDITION, LEARNING_STATUS } from '@/lib/learning/lessons';

export const metadata: Metadata = {
  title: 'Investment Learning Library | OpenMAIC Pilot',
  description:
    'Six built-in educational draft lessons, self-checks and calculators. No API key or model generation required.',
};

export default function LearnPage() {
  return (
    <main
      className="learning-surface mx-auto max-w-4xl space-y-7 px-5 py-8 text-base leading-relaxed"
      lang="en-AU"
    >
      <Link className="inline-block rounded border px-3 py-2 underline print:hidden" href="/">
        Back to home
      </Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          OpenMAIC · experimental education pilot
        </p>
        <h1 className="mt-2 text-3xl font-bold">Investment Learning Library</h1>
        <p className="mt-3">
          Six ready-to-read lessons, eighteen self-check questions, applied scenarios and four
          practice exercises. No API key, model calls or paid generation. Reading works while this
          local app is running; source links need internet access.
        </p>
        <p className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <strong>{LEARNING_STATUS}.</strong> Edition {LEARNING_EDITION}. General education, not
          personal financial advice. Original pilot material informed by IU’s process context and
          Australian primary-source routes; not an official IU course or an endorsement.
        </p>
      </header>
      <LearningResume controls />
      <nav aria-label="Learning modules" className="grid gap-3 sm:grid-cols-2">
        {learningLessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/learn/${lesson.id}`}
            className="rounded-xl border p-4 underline focus-visible:outline focus-visible:outline-2"
          >
            {index + 1}. {lesson.title}
            <span className="block text-sm text-muted-foreground">
              About {lesson.minutes} minutes · self-check included
            </span>
          </Link>
        ))}
      </nav>
      <PracticeLab />
      <Glossary />
      <footer className="border-t py-4 text-sm text-muted-foreground">
        Before publication: verify factual claims and source dates, review numerical examples,
        obtain subject-matter approval, test accessibility and retain the review record. No lesson
        in this library is marked approved.
      </footer>
    </main>
  );
}
