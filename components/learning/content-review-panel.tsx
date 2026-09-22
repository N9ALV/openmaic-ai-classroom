'use client';

import { useEffect, useState } from 'react';
import {
  blankClaim,
  draftReview,
  educationContentHash,
  effectiveReview,
  parseReview,
  REVIEW_EVENT,
  reviewKey,
  reviewSummary,
  transitionReview,
  type EducationReview,
  type EvidenceClaim,
  type ReviewStatus,
} from '@/lib/learning/review';

export function ContentReviewPanel({
  recordId,
  title,
  content,
  initialClaims = [],
}: {
  recordId: string;
  title: string;
  content: string;
  initialClaims?: EvidenceClaim[];
}) {
  const [draft, setDraft] = useState<EducationReview>();
  const [saved, setSaved] = useState<EducationReview>();
  const [message, setMessage] = useState('');
  const claimsJson = JSON.stringify(initialClaims);
  useEffect(() => {
    let cancelled = false;
    setSaved(undefined);
    setDraft(undefined);
    setMessage('');
    educationContentHash(content)
      .then((hash) => {
        if (cancelled) return;
        let record: EducationReview | undefined;
        try {
          record = effectiveReview(
            parseReview(JSON.parse(localStorage.getItem(reviewKey(recordId)) || 'null')),
            hash,
          );
        } catch {
          setMessage(
            'Browser storage is unavailable. You can inspect sources, but cannot save a review here.',
          );
        }
        setSaved(record);
        setDraft(
          record ??
            draftReview(
              title,
              hash,
              initialClaims.length ? JSON.parse(claimsJson) : [blankClaim()],
            ),
        );
      })
      .catch(() => {
        if (!cancelled)
          setMessage('Content version could not be checked. Review recording is unavailable.');
      });
    return () => {
      cancelled = true;
    };
    // The serialised claim set is the stable effect dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, title, content, claimsJson]);
  const change = (patch: Partial<EducationReview>) =>
    setDraft((r) => (r ? { ...r, ...patch, status: 'draft' } : r));
  const claimChange = (index: number, patch: Partial<EvidenceClaim>) => {
    if (draft)
      change({
        claims: draft.claims.map((claim, i) =>
          i === index
            ? {
                ...claim,
                ...patch,
                ...(Object.keys(patch).some((key) => key !== 'checked') ? { checked: false } : {}),
              }
            : claim,
        ),
      });
  };
  const save = (status: ReviewStatus) => {
    if (!draft) return;
    try {
      const next = transitionReview(draft, status, saved);
      localStorage.setItem(reviewKey(recordId), JSON.stringify(next));
      if (localStorage.getItem(reviewKey(recordId)) !== JSON.stringify(next))
        throw new Error('Review could not be verified after saving.');
      setSaved(next);
      setDraft(next);
      setMessage(`Saved ${status} record on this device.`);
      window.dispatchEvent(new Event(REVIEW_EVENT));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review could not be saved.');
    }
  };
  return (
    <section
      className="learning-surface rounded-xl border bg-card p-5 text-base leading-relaxed"
      aria-label="Content review record"
    >
      <h2 className="text-xl font-semibold">Content review record</h2>
      <p className="mt-2 font-semibold">{reviewSummary(saved)}</p>
      <p className="mt-2 text-sm">
        This is a local reviewer’s record, not IU approval or an authenticated signature. Retrieved
        sources still need claim-by-claim human review. Changed content or an overdue review returns
        the effective status to draft.
      </p>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold underline">
          Reviewer workspace — sources and approval
        </summary>
        {draft && (
          <div className="mt-4 space-y-4">
            <p>
              Record actual checks only. Keep private account details out of this record. Include
              every material claim; add more rows as needed.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                Reviewer
                <input
                  className="mt-1 block w-full rounded border bg-background p-2"
                  maxLength={200}
                  value={draft.reviewer}
                  onChange={(e) => change({ reviewer: e.target.value })}
                />
              </label>
              <label className="block">
                Review date
                <input
                  type="date"
                  className="mt-1 block w-full rounded border bg-background p-2"
                  value={draft.reviewedDate}
                  onChange={(e) => change({ reviewedDate: e.target.value })}
                />
              </label>
              <label className="block">
                Review due
                <input
                  type="date"
                  className="mt-1 block w-full rounded border bg-background p-2"
                  value={draft.nextReviewDate}
                  onChange={(e) => change({ nextReviewDate: e.target.value })}
                />
              </label>
            </div>
            {draft.claims.map((claim, index) => (
              <fieldset className="space-y-3 rounded-lg border p-4" key={index}>
                <legend className="px-2 font-semibold">Claim {index + 1}</legend>
                <label className="block">
                  Claim text
                  <textarea
                    className="mt-1 block w-full rounded border bg-background p-2"
                    maxLength={3000}
                    value={claim.claim}
                    onChange={(e) => claimChange(index, { claim: e.target.value })}
                  />
                </label>
                <label className="block">
                  Source link
                  <input
                    type="url"
                    className="mt-1 block w-full rounded border bg-background p-2"
                    maxLength={2048}
                    value={claim.sourceUrl}
                    onChange={(e) => claimChange(index, { sourceUrl: e.target.value })}
                  />
                </label>
                <label className="block">
                  Exact supporting passage or page
                  <input
                    className="mt-1 block w-full rounded border bg-background p-2"
                    maxLength={1000}
                    value={claim.location}
                    onChange={(e) => claimChange(index, { location: e.target.value })}
                  />
                </label>
                <label className="block">
                  Effective date or why not applicable
                  <input
                    className="mt-1 block w-full rounded border bg-background p-2"
                    maxLength={200}
                    value={claim.effectiveDate}
                    onChange={(e) => claimChange(index, { effectiveDate: e.target.value })}
                  />
                </label>
                <label className="block">
                  Date actually retrieved
                  <input
                    type="date"
                    className="ml-3 rounded border bg-background p-2"
                    value={claim.retrievedDate}
                    onChange={(e) => claimChange(index, { retrievedDate: e.target.value })}
                  />
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-2"
                    checked={claim.checked}
                    onChange={(e) => claimChange(index, { checked: e.target.checked })}
                  />
                  <span>
                    I checked this source supports the claim, its date and relevant limitations.
                  </span>
                </label>
                {draft.claims.length > 1 && (
                  <button
                    className="rounded border px-3 py-2"
                    onClick={() => change({ claims: draft.claims.filter((_, i) => i !== index) })}
                  >
                    Remove claim {index + 1}
                  </button>
                )}
              </fieldset>
            ))}
            <button
              className="rounded border px-3 py-2"
              disabled={draft.claims.length >= 100}
              onClick={() => change({ claims: [...draft.claims, blankClaim()] })}
            >
              Add a claim
            </button>
            <div className="flex flex-wrap gap-3">
              {(['draft', 'reviewed', 'approved'] as const).map((status) => (
                <button
                  key={status}
                  className="rounded-lg border px-3 py-2 font-semibold"
                  onClick={() => save(status)}
                >
                  {status === 'draft'
                    ? 'Save draft record'
                    : status === 'reviewed'
                      ? 'Record reviewed'
                      : 'Record approval'}
                </button>
              ))}
            </div>
            <p className="text-sm">
              Recording approval is the reviewer’s explicit action. The application does not
              independently verify the source’s accuracy or the reviewer’s authority.
            </p>
            {saved && (
              <button
                className="rounded border px-3 py-2 underline"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }),
                  );
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'openmaic-content-review.json';
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                Download saved review record
              </button>
            )}
          </div>
        )}
      </details>
      {message && (
        <p role="status" className="mt-4 rounded border p-3">
          {message}
        </p>
      )}
    </section>
  );
}
