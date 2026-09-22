export type ReviewStatus = 'draft' | 'reviewed' | 'approved';
export interface EvidenceClaim {
  claim: string;
  sourceUrl: string;
  location: string;
  effectiveDate: string;
  retrievedDate: string;
  checked: boolean;
}
export interface EducationReview {
  schema: 1;
  title: string;
  contentHash: string;
  status: ReviewStatus;
  reviewer: string;
  reviewedDate: string;
  nextReviewDate: string;
  claims: EvidenceClaim[];
}
export const REVIEW_EVENT = 'openmaic-education-review';
export const reviewKey = (id: string) => `openmaic.education-review.v1:${id}`;
export const blankClaim = (): EvidenceClaim => ({
  claim: '',
  sourceUrl: '',
  location: '',
  effectiveDate: '',
  retrievedDate: '',
  checked: false,
});
export function safeSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}
export async function educationContentHash(content: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(content));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}
export function draftReview(
  title: string,
  contentHash: string,
  claims: EvidenceClaim[] = [blankClaim()],
): EducationReview {
  return {
    schema: 1,
    title,
    contentHash,
    status: 'draft',
    reviewer: '',
    reviewedDate: '',
    nextReviewDate: '',
    claims,
  };
}
export function parseReview(value: unknown): EducationReview | undefined {
  if (!value || typeof value !== 'object') return;
  const r = value as Record<string, unknown>;
  if (
    r.schema !== 1 ||
    typeof r.contentHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(r.contentHash) ||
    !['draft', 'reviewed', 'approved'].includes(String(r.status))
  )
    return;
  if (
    !['title', 'reviewer', 'reviewedDate', 'nextReviewDate'].every(
      (key) => typeof r[key] === 'string' && (r[key] as string).length <= 500,
    )
  )
    return;
  if (!Array.isArray(r.claims) || r.claims.length > 100) return;
  const claims: EvidenceClaim[] = [];
  for (const c of r.claims) {
    if (
      !c ||
      typeof c !== 'object' ||
      !['claim', 'sourceUrl', 'location', 'effectiveDate', 'retrievedDate'].every(
        (key) => typeof c[key] === 'string' && c[key].length <= 3000,
      )
    )
      return;
    if (c.sourceUrl && !safeSourceUrl(c.sourceUrl)) return;
    claims.push({
      claim: c.claim,
      sourceUrl: c.sourceUrl,
      location: c.location,
      effectiveDate: c.effectiveDate,
      retrievedDate: c.retrievedDate,
      checked: c.checked === true,
    });
  }
  return {
    schema: 1,
    title: r.title as string,
    contentHash: r.contentHash,
    status: r.status as ReviewStatus,
    reviewer: r.reviewer as string,
    reviewedDate: r.reviewedDate as string,
    nextReviewDate: r.nextReviewDate as string,
    claims,
  };
}
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export function reviewValidationError(
  record: EducationReview,
  now = new Date(),
): string | undefined {
  const today = now.toISOString().slice(0, 10);
  if (!record.reviewer.trim()) return 'Name the reviewer.';
  if (!validDate(record.reviewedDate) || record.reviewedDate > today)
    return 'Use an actual review date, not a future date.';
  if (!validDate(record.nextReviewDate) || record.nextReviewDate <= today)
    return 'Set a future review-due date.';
  if (
    !record.claims.length ||
    record.claims.some(
      (claim) =>
        !claim.claim.trim() ||
        !safeSourceUrl(claim.sourceUrl) ||
        !claim.location.trim() ||
        !claim.effectiveDate.trim() ||
        !validDate(claim.retrievedDate) ||
        claim.retrievedDate > record.reviewedDate ||
        !claim.checked,
    )
  )
    return 'Complete and check every claim: source link, exact passage, effective date (or why not applicable), and actual retrieval date.';
}
export function effectiveReview(
  record: EducationReview | undefined,
  contentHash: string,
  now = new Date(),
): EducationReview | undefined {
  if (!record) return;
  if (record.contentHash !== contentHash)
    return {
      ...record,
      contentHash,
      status: 'draft',
      claims: record.claims.map((claim) => ({ ...claim, checked: false })),
    };
  if (record.status !== 'draft' && reviewValidationError(record, now))
    return { ...record, status: 'draft' };
  return record;
}
export function transitionReview(
  candidate: EducationReview,
  desired: ReviewStatus,
  previous?: EducationReview,
  now = new Date(),
): EducationReview {
  const record = parseReview(candidate);
  if (!record) throw new Error('The review record is invalid. Check its fields.');
  if (desired !== 'draft') {
    const error = reviewValidationError(record, now);
    if (error) throw new Error(error);
  }
  if (desired === 'approved') {
    const evidence = (r: EducationReview) =>
      JSON.stringify([r.contentHash, r.reviewer, r.reviewedDate, r.nextReviewDate, r.claims]);
    if (previous?.status !== 'reviewed' || evidence(previous) !== evidence(record))
      throw new Error('Save this exact version as reviewed before recording approval.');
  }
  return { ...record, status: desired };
}
export function loadReview(id: string, contentHash: string): EducationReview | undefined {
  try {
    return effectiveReview(
      parseReview(JSON.parse(localStorage.getItem(reviewKey(id)) || 'null')),
      contentHash,
    );
  } catch {
    return undefined;
  }
}
export function reviewSummary(review?: EducationReview): string {
  if (!review || review.status === 'draft') return 'DRAFT — subject-matter approval pending';
  return `${review.status.toUpperCase()} — local record by ${review.reviewer}, ${review.reviewedDate}; review due ${review.nextReviewDate}. Not an authenticated certification.`;
}
