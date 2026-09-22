import type { Stage, Scene } from '@/lib/types/stage';
import {
  draftReview,
  educationContentHash,
  loadReview,
  parseReview,
  reviewKey,
  reviewSummary,
  safeSourceUrl,
  type EducationReview,
} from './review';

export function classroomReviewContent(stage: Stage, scenes: Scene[]): string {
  return JSON.stringify({
    name: stage.name,
    description: stage.description,
    education: stage.education,
    scenes: [...scenes]
      .sort((a, b) => a.order - b.order)
      .map((scene) => ({
        title: scene.title,
        order: scene.order,
        content: scene.content,
        actions: scene.actions,
        whiteboards: scene.whiteboards,
      })),
  });
}
export async function classroomReviewSnapshot(
  stage: Stage,
  scenes: Scene[],
): Promise<EducationReview | undefined> {
  const hash = await educationContentHash(classroomReviewContent(stage, scenes));
  const existing =
    typeof window !== 'undefined' ? loadReview(`classroom:${stage.id}`, hash) : undefined;
  return existing ?? (stage.education ? draftReview(stage.name, hash, []) : undefined);
}
export function classroomEvidenceText(stage: Stage, review?: EducationReview): string {
  return [
    reviewSummary(review),
    'General education. The review is a local record, not an authenticated certification or IU endorsement.',
    ...(stage.education
      ? [
          `Generated: ${stage.education.generatedAt}; model: ${stage.education.model || 'not recorded'}`,
          `Search material retrieved: ${stage.education.retrievedAt || 'not recorded'}. Check effective dates and supporting passages.`,
          ...stage.education.sources.map((source) => `${source.title}: ${source.url}`),
        ]
      : []),
    ...(review?.claims ?? []).map(
      (claim) =>
        `${claim.checked ? 'Reviewer checked' : 'Unchecked'}: ${claim.claim}\n${claim.sourceUrl} — ${claim.location}; effective ${claim.effectiveDate || 'not recorded'}; retrieved ${claim.retrievedDate || 'not recorded'}`,
    ),
  ].join('\n\n');
}
export function parseEducationMetadata(raw: unknown): Stage['education'] | undefined {
  if (!raw || typeof raw !== 'object') return;
  const value = raw as Record<string, unknown>;
  if (
    value.courseType !== 'investment' ||
    typeof value.requirement !== 'string' ||
    typeof value.researchContext !== 'string' ||
    typeof value.generatedAt !== 'string' ||
    !Array.isArray(value.sources)
  )
    return;
  return {
    courseType: 'investment',
    requirement: value.requirement.slice(0, 50_000),
    researchContext: value.researchContext.slice(0, 100_000),
    generatedAt: value.generatedAt.slice(0, 50),
    sources: value.sources
      .filter((s) => s && typeof s.title === 'string' && safeSourceUrl(s.url))
      .slice(0, 100)
      .map((s) => ({ title: s.title.slice(0, 500), url: s.url })),
    ...(typeof value.retrievedAt === 'string'
      ? { retrievedAt: value.retrievedAt.slice(0, 50) }
      : {}),
    ...(typeof value.model === 'string' ? { model: value.model.slice(0, 200) } : {}),
  };
}
export async function restoreImportedReview(stage: Stage, scenes: Scene[], raw: unknown) {
  const record = parseReview(raw);
  if (!record) return;
  const contentHash = await educationContentHash(classroomReviewContent(stage, scenes));
  // Imported files are untrusted. Retain the review notes, but require a new
  // local check; portable metadata is not an authenticated approval.
  const draft: EducationReview = {
    ...record,
    title: stage.name,
    contentHash,
    status: 'draft',
    claims: record.claims.map((claim) => ({ ...claim, checked: false })),
  };
  localStorage.setItem(reviewKey(`classroom:${stage.id}`), JSON.stringify(draft));
}
