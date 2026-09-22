import { describe, expect, it } from 'vitest';
import { assertInvestmentResearch, isInvestmentBrief } from '@/lib/home/investment-research';
import { investmentStarterPrompts } from '@/lib/home/investment-starter-prompts';

describe('investment retrieval gate', () => {
  const requirement = investmentStarterPrompts[0].prompt;
  it('recognises selected and restored legacy briefs', () => {
    expect(investmentStarterPrompts.every((item) => isInvestmentBrief(item.prompt))).toBe(true);
    expect(
      isInvestmentBrief('Create an Australian investment-education classroom titled “ASX”'),
    ).toBe(true);
    expect(isInvestmentBrief('Explain photosynthesis')).toBe(false);
  });
  it('blocks empty research, untrusted schemes and links without context', () => {
    expect(() =>
      assertInvestmentResearch({ requirement }, '', [{ url: 'https://www.asx.com.au' }]),
    ).toThrow();
    expect(() => assertInvestmentResearch({ requirement }, 'context', [])).toThrow();
    expect(() =>
      assertInvestmentResearch({ requirement }, 'context', [{ url: 'javascript:evil()' }]),
    ).toThrow();
    expect(() =>
      assertInvestmentResearch({ requirement }, 'context', [{ url: 'https://www.asx.com.au' }]),
    ).not.toThrow();
  });
  it('does not change general courses without research requirements', () => {
    expect(() => assertInvestmentResearch({ requirement: 'Algebra' }, '', [])).not.toThrow();
    expect(() =>
      assertInvestmentResearch({ requirement: 'Edited brief', requireResearch: true }, '', []),
    ).toThrow();
  });
});
