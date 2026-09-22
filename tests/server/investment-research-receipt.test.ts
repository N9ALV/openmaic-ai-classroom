import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  issueResearchReceipt,
  assertServerInvestmentResearch,
  RESEARCH_RECEIPT_TTL_MS,
} from '@/lib/server/investment-research-receipt';
import { requiresInvestmentResearch } from '@/lib/home/investment-research';

const { resolveModel } = vi.hoisted(() => ({ resolveModel: vi.fn() }));
vi.mock('@/lib/server/resolve-model', () => ({ resolveModelFromRequest: resolveModel }));

describe('server-owned investment retrieval evidence', () => {
  const requirements = {
    requirement: 'Explain diversification for Australian investments',
    courseType: 'investment' as const,
  };
  const context = 'Retrieved evidence about underlying exposures, concentration and market risk.';
  const sources = [
    { title: 'Diversification', url: 'https://moneysmart.gov.au/how-to-invest/diversification' },
  ];
  const now = Date.now();
  const evidence = () => ({
    researchContext: context,
    researchSources: sources,
    ...issueResearchReceipt(requirements.requirement, context, sources, now),
  });
  it('accepts matching retrieval and rejects fabricated, changed and expired evidence', () => {
    expect(() => assertServerInvestmentResearch(requirements, evidence(), now)).not.toThrow();
    expect(() =>
      assertServerInvestmentResearch(
        requirements,
        { researchContext: context, researchSources: sources },
        now,
      ),
    ).toThrow();
    expect(() =>
      assertServerInvestmentResearch(
        requirements,
        { ...evidence(), researchContext: 'Invented context' },
        now,
      ),
    ).toThrow();
    expect(() =>
      assertServerInvestmentResearch(
        { ...requirements, requirement: 'Another investment question' },
        evidence(),
        now,
      ),
    ).toThrow();
    expect(() =>
      assertServerInvestmentResearch(
        requirements,
        { ...evidence(), researchSources: [{ ...sources[0], url: 'https://other.example/' }] },
        now,
      ),
    ).toThrow();
    expect(() =>
      assertServerInvestmentResearch(requirements, evidence(), now + RESEARCH_RECEIPT_TTL_MS + 1),
    ).toThrow();
    expect(() => issueResearchReceipt(requirements.requirement, '', sources, now)).toThrow();
  });
  it('keeps typed investment courses protected after text edits and recognises ordinary finance briefs', () => {
    expect(
      requiresInvestmentResearch({ requirement: 'Changed wording', courseType: 'investment' }),
    ).toBe(true);
    expect(requiresInvestmentResearch({ requirement: 'Explain ETFs' })).toBe(true);
    expect(
      requiresInvestmentResearch({ requirement: 'Explain photosynthesis', courseType: 'general' }),
    ).toBe(false);
  });
  it('rejects direct outline requests before resolving a model', async () => {
    const { POST } = await import('@/app/api/generate/scene-outlines-stream/route');
    resolveModel.mockClear();
    const response = await POST(
      new NextRequest('http://localhost/api/generate/scene-outlines-stream', {
        method: 'POST',
        body: JSON.stringify({ requirements, researchContext: context, researchSources: sources }),
      }),
    );
    expect(response.status).toBe(400);
    expect(resolveModel).not.toHaveBeenCalled();
  });
  it('rejects direct scene-content requests before resolving a model', async () => {
    const { POST } = await import('@/app/api/generate/scene-content/route');
    resolveModel.mockClear();
    const response = await POST(
      new NextRequest('http://localhost/api/generate/scene-content', {
        method: 'POST',
        body: JSON.stringify({
          requirements,
          stageId: 'test-only',
          outline: { title: 'ETFs', type: 'slide' },
          allOutlines: [{}],
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(resolveModel).not.toHaveBeenCalled();
  });
});
