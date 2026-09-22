import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { learningLessons, LEARNING_EDITION, LEARNING_STATUS } from '@/lib/learning/lessons';
import { LessonActions } from '@/components/learning/lesson-actions';
import { PracticeLab } from '@/components/learning/practice-lab';
import { LessonReview } from '@/components/learning/lesson-review';

export function generateStaticParams() {
  return learningLessons.map((lesson) => ({ slug: lesson.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${learningLessons.find((lesson) => lesson.id === slug)?.title ?? 'Lesson'} | OpenMAIC`,
  };
}
export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = learningLessons.findIndex((lesson) => lesson.id === slug);
  if (index < 0) notFound();
  const lesson = learningLessons[index];
  const previous = learningLessons[index - 1];
  const next = learningLessons[index + 1];
  return (
    <main
      className="learning-surface mx-auto max-w-4xl space-y-6 px-5 py-8 text-base leading-relaxed"
      lang="en-AU"
    >
      <nav aria-label="Lesson navigation" className="flex flex-wrap gap-3">
        <Link className="rounded border px-3 py-2 underline" href="/learn">
          All lessons
        </Link>
        <Link className="rounded border px-3 py-2 underline" href="/learn#glossary">
          Glossary
        </Link>
      </nav>
      <header>
        <p>
          Lesson {index + 1} of {learningLessons.length} · about {lesson.minutes} minutes
        </p>
        <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <strong>{LEARNING_STATUS}.</strong> Edition {LEARNING_EDITION}. General education with
          fictional examples, not personal advice or an official IU course.
        </p>
      </header>
      <article id={lesson.id} className="rounded-xl border bg-card p-5 sm:p-7">
        <h2 className="text-xl font-semibold">What you will learn</h2>
        <ul className="my-4 list-disc space-y-1 pl-5">
          {lesson.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
        {lesson.sections.map((section) => (
          <section key={section.heading} className="my-6">
            <h2 className="mb-2 text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text} className="mb-3">
                {text}
              </p>
            ))}
          </section>
        ))}
        <section className="my-6 rounded-lg bg-muted p-4">
          <h2 className="text-xl font-semibold">Apply it: a fictional scenario</h2>
          <p className="mt-2">{lesson.scenario.situation}</p>
          <details className="mt-3">
            <summary className="cursor-pointer font-semibold underline">
              Show the worked reasoning
            </summary>
            <p className="mt-3">{lesson.scenario.workedExample}</p>
          </details>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Practice exercise</h2>
          <p className="mt-2">{lesson.exercise}</p>
          <Link className="mt-3 inline-block underline" href="#practice-lab">
            Open the practice exercises below
          </Link>
        </section>
        <LessonActions lesson={lesson} />
      </article>
      <PracticeLab
        initialMode={
          lesson.id === 'drawdowns'
            ? 'sequence'
            : lesson.id === 'fees'
              ? 'fees'
              : lesson.id === 'currency'
                ? 'currency'
                : 'drawdown'
        }
      />
      <section className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Sources and evidence checks</h2>
        <p className="mt-2">
          These links are reading routes, not proof that every claim is current. Some IU material
          requires membership.
        </p>
        <ul className="my-3 list-disc pl-5">
          {lesson.sources.map((source) => (
            <li key={source.url}>
              <a
                className="break-words underline"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.label}
              </a>{' '}
              ({source.role})
            </li>
          ))}
        </ul>
        <ul className="list-disc pl-5">
          <li>Find the exact passage supporting the claim.</li>
          <li>Check the effective date, assumptions and units.</li>
          <li>Recalculate examples and consider what the source leaves out.</li>
        </ul>
      </section>
      <LessonReview lesson={lesson} />
      <nav
        aria-label="Previous and next lesson"
        className="flex flex-wrap justify-between gap-3 border-t pt-5"
      >
        {previous ? (
          <Link className="rounded border px-3 py-2 underline" href={`/learn/${previous.id}`}>
            Previous lesson
          </Link>
        ) : (
          <Link className="rounded border px-3 py-2 underline" href="/learn">
            Learning library
          </Link>
        )}
        {next ? (
          <Link
            className="rounded bg-blue-700 px-4 py-2 font-semibold text-white"
            href={`/learn/${next.id}`}
          >
            Next lesson: {next.title}
          </Link>
        ) : (
          <Link className="rounded border px-3 py-2 underline" href="/learn">
            Return to your learning progress
          </Link>
        )}
      </nav>
    </main>
  );
}
