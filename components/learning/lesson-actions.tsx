'use client';

import { useEffect, useState } from 'react';
import {
  lessonWorkbook,
  lessonVersion,
  LEARNING_EDITION,
  type LearningLesson,
} from '@/lib/learning/lessons';
import { loadLearningProgress, saveLessonProgress } from '@/lib/learning/progress';
import { educationContentHash, loadReview } from '@/lib/learning/review';

export function LessonActions({ lesson }: { lesson: LearningLesson }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [remember, setRemember] = useState(false);
  const [reflection, setReflection] = useState('');
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const version = lessonVersion(lesson);
  useEffect(() => {
    try {
      const old = loadLearningProgress().lessons[lesson.id];
      if (old?.version === version) {
        setAnswers(old.answers ?? {});
        setReflection(old.reflection ?? '');
        setRemember(old.rememberAnswers === true);
        setCompleted(old.completed);
      }
      saveLessonProgress(lesson.id, old?.version === version ? old : { version, completed: false });
    } catch {
      setMessage(
        'Browser storage is unavailable. Your answers work here, but progress cannot be saved.',
      );
    }
  }, [lesson.id, version]);
  const persist = (
    nextAnswers: Record<number, number>,
    nextReflection: string,
    nextRemember: boolean,
    nextCompleted: boolean,
  ) => {
    try {
      saveLessonProgress(lesson.id, {
        version,
        completed: nextCompleted,
        rememberAnswers: nextRemember,
        ...(nextRemember ? { answers: nextAnswers, reflection: nextReflection } : {}),
      });
      return true;
    } catch {
      setMessage(
        'Progress could not be saved on this device. Keep this page open or download a workbook.',
      );
      return false;
    }
  };
  const complete = lesson.questions.every((_, index) => answers[index] !== undefined);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([lessonWorkbook(lesson)], { type: 'text/markdown;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `investment-learning-${lesson.id}-workbook.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };
  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const { createLessonWorkbookPdf } = await import('@/lib/learning/workbook-pdf');
      const hash = await educationContentHash(
        JSON.stringify({ edition: LEARNING_EDITION, lesson }),
      );
      const review = loadReview(`lesson:${lesson.id}`, hash);
      const bytes = await createLessonWorkbookPdf(lesson, review);
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `investment-learning-${lesson.id}-workbook.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('PDF workbook prepared. Look in your browser’s Downloads.');
    } catch {
      setMessage(
        'The PDF could not be created. You can download the editable text workbook instead.',
      );
    } finally {
      setPdfBusy(false);
    }
  };
  return (
    <div className="mt-5 border-t pt-4">
      <h2 className="text-xl font-semibold">Check your understanding</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Self-check only; not a certificate or suitability assessment. Progress is local to this
        browser. Answers are remembered only if you choose below.
      </p>
      <label className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => {
            setRemember(e.target.checked);
            persist(answers, reflection, e.target.checked, completed);
          }}
        />
        Remember my answers on this device
      </label>
      {lesson.questions.map((question, index) => (
        <fieldset key={index} className="mb-5">
          <legend className="mb-2 font-medium">
            {index + 1}. {question.prompt}
          </legend>
          {question.choices.map((choice, answer) => (
            <label key={choice} className="mb-1 flex items-start gap-2 rounded-lg border p-2">
              <input
                className="mt-1"
                type="radio"
                name={`${lesson.id}-q${index}`}
                checked={answers[index] === answer}
                onChange={() => {
                  const next = { ...answers, [index]: answer };
                  setAnswers(next);
                  persist(next, reflection, remember, false);
                  setCompleted(false);
                  setChecked(false);
                }}
              />
              <span>{choice}</span>
            </label>
          ))}
          {checked && (
            <p className="mt-2 rounded bg-blue-500/10 p-3">
              {question.feedback?.[answers[index]] ??
                (answers[index] === question.correct ? 'Correct. ' : 'Review this point. ')}{' '}
              {question.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <label className="mb-4 block font-semibold">
        Explain it in your own words
        <span className="my-2 block font-normal">
          {lesson.scenario.reflection} Use fictional examples, not private account details.
        </span>
        <textarea
          rows={4}
          maxLength={3000}
          className="block w-full rounded-lg border bg-background p-3 font-normal"
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            persist(answers, e.target.value, remember, completed);
          }}
        />
      </label>
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          className="rounded-lg bg-blue-700 px-4 py-3 text-white disabled:opacity-50"
          disabled={!complete}
          onClick={() => setChecked(true)}
        >
          Check answers
        </button>
        <button className="rounded-lg border px-3 py-2" disabled={pdfBusy} onClick={downloadPdf}>
          {pdfBusy ? 'Preparing PDF…' : 'Download PDF workbook'}
        </button>
        <button className="rounded-lg border px-3 py-2" onClick={download}>
          Download editable text workbook
        </button>
        <button
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
          disabled={!complete || !checked}
          onClick={() => {
            if (persist(answers, reflection, remember, true)) setCompleted(true);
          }}
        >
          Mark lesson complete
        </button>
      </div>
      {checked && (
        <p role="status" className="mt-3 font-semibold">
          {lesson.questions.filter((question, index) => answers[index] === question.correct).length}{' '}
          of {lesson.questions.length} correct. Read the explanations above.
        </p>
      )}
      {completed && <p className="mt-3 font-semibold">Lesson marked complete on this device.</p>}
      <p className="mt-4 text-sm">
        The PDF is a printable lesson, not a complete interactive-classroom backup. A local browser
        address cannot be shared with someone on another computer. Review the file and its
        draft/approval status before sharing.
      </p>
      {message && (
        <p role="status" className="mt-3 rounded border p-3">
          {message}
        </p>
      )}
    </div>
  );
}
