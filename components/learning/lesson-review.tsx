import type { LearningLesson } from '@/lib/learning/lessons';
import { LEARNING_EDITION } from '@/lib/learning/lessons';
import { blankClaim } from '@/lib/learning/review';
import { ContentReviewPanel } from './content-review-panel';

export const lessonReviewContent = (lesson: LearningLesson) =>
  JSON.stringify({ edition: LEARNING_EDITION, lesson });
export function LessonReview({ lesson }: { lesson: LearningLesson }) {
  return (
    <ContentReviewPanel
      recordId={`lesson:${lesson.id}`}
      title={lesson.title}
      content={lessonReviewContent(lesson)}
      initialClaims={lesson.sections.map((section) => ({
        ...blankClaim(),
        claim: section.paragraphs[0],
        sourceUrl: '',
      }))}
    />
  );
}
