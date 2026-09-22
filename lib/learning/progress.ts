import { learningLessons, lessonVersion } from './lessons';

export const LEARNING_PROGRESS_KEY = 'openmaic.learning-progress.v1';
export const LEARNING_PROGRESS_EVENT = 'openmaic-learning-progress';
export interface LessonProgress {
  version: string;
  completed: boolean;
  rememberAnswers?: boolean;
  answers?: Record<number, number>;
  reflection?: string;
}
export interface LearningProgress {
  schema: 1;
  lastLessonId?: string;
  lessons: Record<string, LessonProgress>;
}
export function parseLearningProgress(raw: string | null): LearningProgress {
  const result: LearningProgress = { schema: 1, lessons: {} };
  if (!raw) return result;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.schema !== 1 || typeof parsed.lessons !== 'object' || !parsed.lessons)
      return result;
    for (const lesson of learningLessons) {
      const entry = parsed.lessons[lesson.id];
      if (entry?.version !== lessonVersion(lesson)) continue;
      const answers: Record<number, number> = {};
      for (const [index, question] of lesson.questions.entries()) {
        const answer = entry.answers?.[index];
        if (Number.isInteger(answer) && answer >= 0 && answer < question.choices.length)
          answers[index] = answer;
      }
      result.lessons[lesson.id] = {
        version: entry.version,
        completed: entry.completed === true,
        rememberAnswers: entry.rememberAnswers === true,
        ...(entry.rememberAnswers === true
          ? {
              answers,
              reflection:
                typeof entry.reflection === 'string' ? entry.reflection.slice(0, 3000) : '',
            }
          : {}),
      };
    }
    if (typeof parsed.lastLessonId === 'string' && result.lessons[parsed.lastLessonId])
      result.lastLessonId = parsed.lastLessonId;
  } catch {
    /* A malformed record must not make lessons unavailable. */
  }
  return result;
}
export function loadLearningProgress(): LearningProgress {
  return parseLearningProgress(localStorage.getItem(LEARNING_PROGRESS_KEY));
}
export function saveLessonProgress(id: string, entry: LessonProgress): void {
  const progress = loadLearningProgress();
  progress.lastLessonId = id;
  progress.lessons[id] = entry;
  localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(LEARNING_PROGRESS_EVENT));
}
