import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  assertInvestmentResearch,
  requiresInvestmentResearch,
} from '@/lib/home/investment-research';
import type { ResearchEvidence, UserRequirements } from '@/lib/types/generation';

export const RESEARCH_RECEIPT_TTL_MS = 4 * 60 * 60 * 1000;
const runtime = globalThis as typeof globalThis & { __openmaicResearchKey?: Buffer };
function signingKey() {
  // A local pilot needs no account or new storage. A restart requires fresh
  // retrieval. Multi-instance hosting needs an operator-managed shared secret.
  return process.env.RESEARCH_RECEIPT_SECRET || (runtime.__openmaicResearchKey ??= randomBytes(32));
}
function sourceIdentity(sources: unknown) {
  if (!Array.isArray(sources) || sources.length > 100)
    throw new Error('Invalid research source set.');
  return sources.map((source) => {
    if (!source || typeof source.url !== 'string' || typeof source.title !== 'string')
      throw new Error('Invalid research source.');
    return { title: source.title, url: source.url };
  });
}
function digest(query: string, context: string, sources: unknown) {
  return createHash('sha256')
    .update(JSON.stringify([query.trim(), context, sourceIdentity(sources)]))
    .digest('hex');
}
export function issueResearchReceipt(
  query: string,
  context: string,
  sources: unknown,
  now = Date.now(),
) {
  assertInvestmentResearch({ requirement: query, requireResearch: true }, context, sources);
  const payload = Buffer.from(
    JSON.stringify({ v: 1, issued: now, hash: digest(query, context, sources) }),
  ).toString('base64url');
  const signature = createHmac('sha256', signingKey()).update(payload).digest('base64url');
  return { researchReceipt: `${payload}.${signature}`, retrievedAt: new Date(now).toISOString() };
}
export function assertServerInvestmentResearch(
  requirements: UserRequirements | undefined,
  evidence: ResearchEvidence,
  now = Date.now(),
): void {
  if (!requiresInvestmentResearch(requirements)) return;
  assertInvestmentResearch(requirements!, evidence.researchContext, evidence.researchSources);
  const error = () =>
    new Error(
      'Investment research is missing, changed or expired. Return to the builder and run Web Search again before generating. Retrieved material still needs human review.',
    );
  const token = evidence.researchReceipt;
  if (typeof token !== 'string' || token.length > 1024) throw error();
  const [payload, signature, extra] = token.split('.');
  if (
    !payload ||
    !signature ||
    extra !== undefined ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature)
  )
    throw error();
  const expected = createHmac('sha256', signingKey()).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (
    actual.length !== expected.length ||
    actual.toString('base64url') !== signature ||
    !timingSafeEqual(expected, actual)
  )
    throw error();
  try {
    const receipt = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (
      receipt.v !== 1 ||
      !Number.isSafeInteger(receipt.issued) ||
      receipt.issued > now + 60_000 ||
      now - receipt.issued > RESEARCH_RECEIPT_TTL_MS ||
      receipt.hash !==
        digest(requirements!.requirement, evidence.researchContext!, evidence.researchSources)
    )
      throw error();
  } catch {
    throw error();
  }
}
