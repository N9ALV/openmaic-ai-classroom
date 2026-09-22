import { describe, expect, it } from 'vitest';
import { audReturn, feeBalance, recoveryGain, withdrawalPath } from '@/lib/learning/calculations';
import { learningLessons, lessonWorkbook, LEARNING_STATUS } from '@/lib/learning/lessons';

describe('built-in learning library', () => {
  it('ships six original complete draft lessons and valid questions', () => {
    expect(learningLessons).toHaveLength(6);
    expect(new Set(learningLessons.map((lesson) => lesson.id)).size).toBe(6);
    for (const lesson of learningLessons) {
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
      expect(lesson.questions).toHaveLength(3);
      for (const question of lesson.questions) {
        expect(question.choices[question.correct]).toBeTruthy();
        expect(question.explanation.length).toBeGreaterThan(30);
      }
      for (const source of lesson.sources) expect(new URL(source.url).protocol).toBe('https:');
      const workbook = lessonWorkbook(lesson);
      expect(workbook).toContain(LEARNING_STATUS);
      expect(workbook).toContain('not personal financial advice');
      expect(workbook).toContain('## Answer explanations');
    }
  });
});
describe('education arithmetic', () => {
  it('shows sequence risk, no-withdrawal equivalence and unfunded withdrawals', () => {
    expect(withdrawalPath(100000, [-20, 25], 10000).map((year) => year.balance)).toEqual([
      70000, 77500,
    ]);
    expect(withdrawalPath(100000, [25, -20], 10000).map((year) => year.balance)).toEqual([
      115000, 82000,
    ]);
    expect(withdrawalPath(100000, [-20, 25], 0)[1].balance).toBe(100000);
    expect(withdrawalPath(100000, [25, -20], 0)[1].balance).toBe(100000);
    expect(withdrawalPath(100, [-100, 100], 10)).toEqual([
      { balance: 0, paid: 0, shortfall: 10, rate: -100 },
      { balance: 0, paid: 0, shortfall: 10, rate: 100 },
    ]);
    expect(() => withdrawalPath(100, [NaN], 10)).toThrow();
  });
  it('handles asymmetric and complete losses', () => {
    expect(recoveryGain(0)).toBe(0);
    expect(recoveryGain(20)).toBe(25);
    expect(recoveryGain(50)).toBe(100);
    expect(recoveryGain(100)).toBeNull();
    expect(() => recoveryGain(-1)).toThrow();
    expect(() => recoveryGain(NaN)).toThrow();
  });
  it('uses correctly labelled USD per AUD, including a total loss', () => {
    expect(audReturn(10, 0.65, 0.7)).toBeCloseTo(2.142857, 5);
    expect(audReturn(10, 0.65, 0.65)).toBeCloseTo(10);
    expect(audReturn(-100, 0.65, 0.7)).toBe(-100);
    expect(() => audReturn(10, 0, 0.7)).toThrow();
  });
  it('states and applies year-end percentage fees', () => {
    expect(feeBalance(100, 5, 1, 1)).toBeCloseTo(103.95);
    expect(feeBalance(100, 5, 1, 0)).toBe(100);
    expect(feeBalance(100, -100, 1, 20)).toBe(0);
    expect(feeBalance(10000, 5, 0.3, 20)).toBeGreaterThan(feeBalance(10000, 5, 1, 20));
    expect(() => feeBalance(100, Infinity, 1, 1)).toThrow();
    expect(() => feeBalance(100, 5, 1, 1.5)).toThrow();
  });
});
