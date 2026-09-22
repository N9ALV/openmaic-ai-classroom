import { describe, expect, it } from 'vitest';
import { learningLessons, lessonVersion, LEARNING_EDITION } from '@/lib/learning/lessons';
import { parseLearningProgress } from '@/lib/learning/progress';
import {
  blankClaim,
  draftReview,
  educationContentHash,
  effectiveReview,
  parseReview,
  transitionReview,
} from '@/lib/learning/review';
import { createLessonWorkbookPdf } from '@/lib/learning/workbook-pdf';
import { PDFDocument } from 'pdf-lib';
import { extractText } from 'unpdf';

describe('versioned local learning records', () => {
  const lesson = learningLessons[0];
  it('restores valid progress without trusting corrupt, stale or opted-out answers', () => {
    const raw = JSON.stringify({
      schema: 1,
      lastLessonId: lesson.id,
      lessons: {
        [lesson.id]: {
          version: lessonVersion(lesson),
          completed: true,
          rememberAnswers: true,
          answers: { 0: 1, 1: 999 },
          reflection: 'Fictional practice',
        },
      },
    });
    expect(parseLearningProgress(raw).lessons[lesson.id]).toMatchObject({
      completed: true,
      answers: { 0: 1 },
    });
    expect(
      parseLearningProgress(raw.replace(lessonVersion(lesson), 'old-edition')).lessons,
    ).toEqual({});
    expect(
      parseLearningProgress(raw.replace('"rememberAnswers":true', '"rememberAnswers":false'))
        .lessons[lesson.id].answers,
    ).toBeUndefined();
    expect(parseLearningProgress('broken')).toEqual({ schema: 1, lessons: {} });
    expect(lessonVersion({ ...lesson, title: 'Changed title' })).not.toBe(lessonVersion(lesson));
  });
});

describe('human review records', () => {
  const now = new Date('2026-09-22T12:00:00Z');
  const hash = 'a'.repeat(64);
  const ready = () => ({
    ...draftReview('Lesson', hash),
    reviewer: 'Test reviewer',
    reviewedDate: '2026-09-22',
    nextReviewDate: '2026-10-22',
    claims: [
      {
        ...blankClaim(),
        claim: 'A 20% loss requires a 25% recovery.',
        sourceUrl: 'https://example.org/lesson',
        location: 'Worked arithmetic, paragraph 1',
        effectiveDate: 'Arithmetic, no changing rule',
        retrievedDate: '2026-09-22',
        checked: true,
      },
    ],
  });
  it('requires actual evidence checks and a separate reviewed transition before approval', () => {
    expect(() =>
      transitionReview(draftReview('Lesson', hash), 'reviewed', undefined, now),
    ).toThrow();
    expect(() => transitionReview(ready(), 'approved', undefined, now)).toThrow(/reviewed/);
    const reviewed = transitionReview(ready(), 'reviewed', undefined, now);
    expect(transitionReview(reviewed, 'approved', reviewed, now).status).toBe('approved');
    expect(() =>
      transitionReview({ ...reviewed, reviewer: 'Changed reviewer' }, 'approved', reviewed, now),
    ).toThrow(/exact version/);
  });
  it('invalidates approval after edits, expiry or incomplete evidence', () => {
    const approved = { ...ready(), status: 'approved' as const };
    expect(effectiveReview(approved, 'b'.repeat(64), now)).toMatchObject({
      status: 'draft',
      claims: [{ checked: false }],
    });
    expect(effectiveReview(approved, hash, new Date('2026-11-01'))?.status).toBe('draft');
    expect(effectiveReview({ ...approved, claims: [] }, hash, now)?.status).toBe('draft');
    expect(() =>
      transitionReview({ ...ready(), reviewedDate: '2026-10-01' }, 'reviewed', undefined, now),
    ).toThrow(/future/);
    expect(
      parseReview({
        ...approved,
        claims: [{ ...approved.claims[0], sourceUrl: 'javascript:alert(1)' }],
      }),
    ).toBeUndefined();
  });
  it('binds review identity to complete content, not only a title', async () => {
    expect(await educationContentHash({ title: 'Same', body: 'A' })).not.toBe(
      await educationContentHash({ title: 'Same', body: 'B' }),
    );
  });
});

describe('offline PDF workbook', () => {
  it('contains the lesson, exercises, answers, sources, version and draft status', async () => {
    const bytes = await createLessonWorkbookPdf(learningLessons[0]);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(2);
    expect(pdf.getSubject()).toContain('DRAFT');
    const { text } = await extractText(new Uint8Array(bytes), { mergePages: true });
    expect(text).toContain('ASX foundations');
    expect(text).toContain('Answer section');
    expect(text).toContain('moneysmart.gov.au');
    expect(text).toContain(LEARNING_EDITION);
  });
});
