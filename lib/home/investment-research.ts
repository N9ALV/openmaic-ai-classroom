import type { UserRequirements } from '@/lib/types/generation';

export const INVESTMENT_RESEARCH_MARKER = '[AU-INVESTMENT-EDUCATION]';
export const INVESTMENT_RESEARCH_MESSAGE =
  'These investment briefs need a configured research provider. Open Settings → Web Search, or read the built-in lessons without an API key. No AI generation has started.';

export function isInvestmentBrief(text: string): boolean {
  if (typeof text !== 'string') return false;
  return (
    text.includes(INVESTMENT_RESEARCH_MARKER) ||
    text.trimStart().startsWith('Create an Australian investment-education classroom titled') ||
    /\b(?:ASX|ETFs?|invest(?:ing|ment|ments)|retirement|superannuation|dividends?|capital gains|portfolio|AUD\/USD)\b/i.test(
      text,
    )
  );
}

export function requiresInvestmentResearch(requirements?: UserRequirements): boolean {
  return (
    !!requirements &&
    (requirements.courseType === 'investment' ||
      requirements.requireResearch === true ||
      isInvestmentBrief(requirements.requirement))
  );
}

/** Retrieval evidence, not editorial approval. Never treat a URL list alone as research. */
export function assertInvestmentResearch(
  requirements: UserRequirements,
  context: unknown,
  sources: unknown,
): void {
  if (!requiresInvestmentResearch(requirements)) return;
  const hasSource =
    Array.isArray(sources) &&
    sources.some((source) => {
      if (!source || typeof source.url !== 'string') return false;
      try {
        const url = new URL(source.url);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    });
  if (typeof context !== 'string' || !context.trim() || !hasSource) {
    throw new Error(
      'Research returned no usable source material. Investment generation has stopped rather than inventing citations. Check Web Search settings, retry later, or use the built-in lessons.',
    );
  }
}
