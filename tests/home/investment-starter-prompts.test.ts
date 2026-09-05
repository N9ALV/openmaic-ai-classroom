import { describe, expect, it } from 'vitest';

import { investmentStarterPrompts } from '@/lib/home/investment-starter-prompts';

describe('Australian investment learning starters', () => {
  it('has stable unique identifiers and reviewable content', () => {
    expect(investmentStarterPrompts).toHaveLength(6);
    expect(new Set(investmentStarterPrompts.map((starter) => starter.id)).size).toBe(
      investmentStarterPrompts.length,
    );

    for (const starter of investmentStarterPrompts) {
      expect(starter.id).toMatch(/^[a-z0-9-]+$/);
      expect(starter.title.length).toBeGreaterThan(5);
      expect(starter.summary.length).toBeGreaterThan(20);
      expect(starter.prompt.length).toBeGreaterThan(800);
    }
  });

  it('builds safety and evidence checks into every prompt', () => {
    for (const starter of investmentStarterPrompts) {
      expect(starter.prompt).toContain('general educational content');
      expect(starter.prompt).toContain('not personal financial advice');
      expect(starter.prompt).toContain('fees, spreads, tax, liquidity');
      expect(starter.prompt).toContain('AUD/USD currency exposure');
      expect(starter.prompt).toContain('Date every time-sensitive claim');
      expect(starter.prompt).toContain('Never promise returns');
      expect(starter.prompt).toContain('https://moneysmart.gov.au/');
      expect(starter.prompt).toContain('https://www.ato.gov.au/');
      expect(starter.prompt).not.toMatch(/guaranteed returns?/i);
    }
  });

  it('includes each declared IU supporting source in its generated prompt', () => {
    for (const starter of investmentStarterPrompts) {
      expect(starter.sources.length).toBeGreaterThan(0);
      for (const source of starter.sources) {
        expect(source).toMatch(/^https:\/\/iu\.com\.au\//);
        expect(starter.prompt).toContain(source);
      }
    }
  });
});
