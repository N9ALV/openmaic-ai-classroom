import { afterEach, describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import type { Stage } from '@/lib/types/stage';
import { buildClassroomExportZip } from '@/lib/export/use-export-classroom';
import { buildPptxBlob } from '@/lib/export/use-export-pptx';
import { restoreImportedReview } from '@/lib/learning/classroom-review';
import { draftReview, reviewKey } from '@/lib/learning/review';

vi.mock('@/lib/document-store', () => ({
  accessDocument: vi.fn(async () => ({ document: null })),
}));
vi.mock('@/lib/pbl/v2/runtime/document-persistence', () => ({
  preparePBLScenesForDocumentPersistence: vi.fn(async (_id, scenes) => scenes),
}));

const stage: Stage = {
  id: 'synthetic-export',
  name: 'Investment test',
  createdAt: 1,
  updatedAt: 1,
  education: {
    courseType: 'investment',
    requirement: 'Explain investment risk',
    researchContext: 'Synthetic retrieved context',
    sources: [{ title: 'Test evidence', url: 'https://example.org/evidence' }],
    retrievedAt: '2026-09-22T00:00:00Z',
    generatedAt: '2026-09-22T00:01:00Z',
  },
};

afterEach(() => vi.unstubAllGlobals());
describe('portable education evidence', () => {
  it('retains provenance and unapproved status in the classroom ZIP', async () => {
    const result = await buildClassroomExportZip(stage, []);
    const zip = await JSZip.loadAsync(await result.zip.arrayBuffer());
    const manifest = JSON.parse(await zip.file('manifest.json')!.async('string'));
    expect(manifest.stage.education.sources).toEqual(stage.education!.sources);
    expect(manifest.stage.review.status).toBe('draft');
    expect(await zip.file('SOURCES-AND-REVIEW.txt')!.async('string')).toContain('DRAFT');
    expect(
      JSON.parse(await zip.file('education-review.json')!.async('string')).evidence.researchContext,
    ).toBe('Synthetic retrieved context');
  });
  it('includes a visible review/source page in PowerPoint output', async () => {
    const blob = await buildPptxBlob(
      [],
      [],
      0.5625,
      1000,
      100,
      1,
      stage.id,
      'DRAFT — test-only\nhttps://example.org/evidence',
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const slide = await zip.file('ppt/slides/slide1.xml')!.async('string');
    expect(slide).toContain('Sources and review record');
    expect(slide).toContain('DRAFT');
    expect(slide).toContain('https://example.org/evidence');
  });
  it('retains imported review notes as unchecked draft rather than authenticating their approval', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const record = {
      ...draftReview(stage.name, 'a'.repeat(64)),
      status: 'approved' as const,
      claims: [
        {
          claim: 'Synthetic claim',
          sourceUrl: 'https://example.org/evidence',
          location: 'Test',
          effectiveDate: 'Test',
          retrievedDate: '2026-09-22',
          checked: true,
        },
      ],
    };
    await restoreImportedReview(stage, [], record);
    expect(JSON.parse(storage.get(reviewKey(`classroom:${stage.id}`))!)).toMatchObject({
      status: 'draft',
      claims: [{ checked: false }],
    });
  });
});
