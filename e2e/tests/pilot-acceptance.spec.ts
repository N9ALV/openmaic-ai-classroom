import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { investmentStarterPrompts } from '../../lib/home/investment-starter-prompts';

const providerFixture = (research = false) => ({
  success: true,
  providers: { openrouter: { models: ['test-only'] } },
  tts: {},
  asr: {},
  pdf: {},
  image: {},
  video: {},
  // Brave is a built-in keyless search route. Explicitly disable it for the
  // unavailable-research case instead of assuming that no API key means none.
  webSearch: research ? { tavily: {} } : { brave: { disabled: true } },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('locale', 'en-US'));
  // Fail closed: no test may reach a live generation provider.
  await page.route('**/api/**', async (route) => {
    const name = new URL(route.request().url()).pathname;
    if (name === '/api/server-providers') return route.fulfill({ json: providerFixture() });
    if (name === '/api/access-code/status')
      return route.fulfill({ json: { required: false, authenticated: true } });
    if (route.request().method() !== 'GET')
      return route.fulfill({
        status: 503,
        json: { error: 'Unmocked generation is forbidden in acceptance tests.' },
      });
    return route.continue();
  });
});

test('complete library and workbooks are usable without model calls', async ({
  page,
}, testInfo) => {
  let writes = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') writes++;
  });
  await page.goto('/learn');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Investment Learning Library');
  await expect(
    page.getByRole('navigation', { name: 'Learning modules' }).getByRole('link'),
  ).toHaveCount(6);
  await expect(
    page.getByText('Editorial draft — subject-matter approval pending.', { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole('link', { name: /1\. ASX foundations/ }).click();
  await expect(page).toHaveURL(/learn\/asx-foundations/);
  const lesson = page.locator('#asx-foundations');
  await lesson.getByLabel('No. Inspect its mandate, holdings and structure.').check();
  await lesson.getByLabel('Define the objective, constraints and realistic alternative.').check();
  await lesson.getByLabel('The required access date and ability to withstand a shortfall.').check();
  await lesson.getByRole('button', { name: 'Check answers' }).click();
  await expect(lesson.getByRole('status')).toContainText('3 of 3 correct');
  const downloadPromise = page.waitForEvent('download');
  await lesson.getByRole('button', { name: 'Download PDF workbook' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('investment-learning-asx-foundations-workbook.pdf');
  expect(await download.failure()).toBeNull();
  const path = testInfo.outputPath('asx-workbook.pdf');
  await download.saveAs(path);
  const pdf = await PDFDocument.load(await readFile(path));
  expect(pdf.getPageCount()).toBeGreaterThan(2);
  expect(pdf.getSubject()).toContain('DRAFT');
  expect(writes).toBe(0);
});

test('arithmetic widgets handle normal values, invalid input and complete loss', async ({
  page,
}) => {
  await page.goto('/learn');
  await expect(page.locator('output')).toContainText('25%');
  await page.getByLabel('Loss (%)', { exact: true }).fill('100');
  await expect(page.locator('output')).toContainText('complete loss');
  await page.getByLabel('Loss (%)', { exact: true }).fill('');
  await expect(page.locator('output')).toContainText('Fill in every value');
  await page.getByRole('combobox', { name: 'Exercise', exact: true }).selectOption('currency');
  await expect(page.locator('output')).toContainText('2.14%');
  await page.getByRole('combobox', { name: 'Exercise', exact: true }).selectOption('fees');
  await expect(page.locator('output')).toContainText('Final balance A');
  await page.getByRole('combobox', { name: 'Exercise', exact: true }).selectOption('sequence');
  await expect(page.locator('output')).toContainText('77,500');
  await expect(page.locator('output')).toContainText('82,000');
  await page.getByLabel('Year-end withdrawal (AUD)', { exact: true }).fill('0');
  await expect(page.locator('output')).toContainText('100,000');
});

test('investment starter cannot generate without research, and protects an existing draft', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /OpenRouter.*test-only/ })).toBeVisible();
  await page.getByTestId('investment-starter-asx-investing-foundations').click();
  await expect(page.getByRole('button', { name: 'Enter Classroom', exact: true })).toBeDisabled();
  await expect(
    page.getByRole('status').filter({ hasText: 'need a configured research provider' }),
  ).toBeVisible();
  const before = await page.locator('textarea').first().inputValue();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByTestId('investment-starter-aud-usd-investing').click();
  await expect(page.locator('textarea').first()).toHaveValue(before);
  await expect(page.getByRole('link', { name: /Read the built-in lessons/ })).toHaveAttribute(
    'href',
    '/learn',
  );
});

test('configured research is enabled and empty results stop before model generation', async ({
  page,
}) => {
  await page.route('**/api/server-providers', (route) =>
    route.fulfill({
      json: providerFixture(true),
    }),
  );
  let researchRequests = 0;
  await page.route('**/api/web-search', (route) => {
    researchRequests++;
    expect(route.request().postDataJSON().query).toContain('[AU-INVESTMENT-EDUCATION]');
    return route.fulfill({ json: { context: '', sources: [] } });
  });
  let outlineRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/generate/scene-outlines')) outlineRequests++;
  });
  await page.goto('/');
  await page.getByTestId('investment-starter-asx-investing-foundations').click();
  await expect(page.getByRole('button', { name: 'Enter Classroom', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Enter Classroom', exact: true }).click();
  await expect(page).toHaveURL(/generation-preview/);
  await expect(page.getByText(/Research returned no usable source material/)).toBeVisible();
  expect(outlineRequests).toBe(0);
  expect(researchRequests).toBeGreaterThan(0);
});

test('a restored investment session cannot bypass the research gate', async ({ page }) => {
  await page.addInitScript((prompt) => {
    sessionStorage.setItem(
      'generationSession',
      JSON.stringify({
        sessionId: 'restored-pilot',
        requirements: { requirement: prompt, webSearch: false },
        pdfText: '',
        pdfImages: [],
        imageStorageIds: [],
        sceneOutlines: null,
        currentStep: 'generating',
      }),
    );
  }, investmentStarterPrompts[0].prompt);
  await page.goto('/generation-preview');
  await expect(page.getByText(/requires research. Return home/)).toBeVisible();
});

test('mobile library does not overflow the viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learn');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('learning-library-mobile.png') });
  await page.goto('/learn/drawdowns');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: /Next lesson/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('lesson-mobile.png') });
});

test('learning is discoverable on a laptop before scrolling and controls are named', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 585 });
  await page.goto('/');
  const start = page.getByRole('link', { name: 'Start learning', exact: true });
  await expect(start).toBeVisible();
  const box = await start.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(585);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Learn investing, one step at a time',
  );
  for (const name of [
    'Choose colour theme',
    'Open settings',
    'Web search settings',
    'Image, video and voice options',
  ])
    await expect(page.getByRole('button', { name, exact: true })).toBeAttached();
  await page.screenshot({ path: testInfo.outputPath('learner-first-home.png') });
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/learn$/);
});

test('quiz answers are optional, progress resumes after reload and reset is scoped', async ({
  page,
}) => {
  await page.goto('/learn/asx-foundations');
  await page.getByLabel('Remember my answers on this device', { exact: true }).check();
  await page.getByLabel('No. Inspect its mandate, holdings and structure.').check();
  await page.getByLabel('Define the objective, constraints and realistic alternative.').check();
  await page.getByLabel('The required access date and ability to withstand a shortfall.').check();
  await page.getByRole('button', { name: 'Check answers', exact: true }).click();
  await page.getByRole('button', { name: 'Mark lesson complete', exact: true }).click();
  await page.reload();
  await expect(page.getByLabel('No. Inspect its mandate, holdings and structure.')).toBeChecked();
  await expect(page.getByText('Lesson marked complete on this device.')).toBeVisible();
  await page.goto('/learn');
  await expect(page.getByText(/1 of 6 lessons marked complete/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Continue learning: ASX/ })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('unrelated-user-data', 'preserve'));
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset local progress' }).click();
  await expect(page.getByText(/0 of 6 lessons marked complete/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('unrelated-user-data'))).toBe('preserve');
});

test('review workflow refuses unchecked claims and records only explicit local approval', async ({
  page,
}) => {
  await page.goto('/learn/fees');
  await page.getByText('Reviewer workspace — sources and approval', { exact: true }).click();
  await page.getByRole('button', { name: 'Record approval', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Name the reviewer' })).toBeVisible();
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  // Synthetic reviewer/evidence in an isolated browser; not editorial approval.
  await page.getByLabel('Reviewer', { exact: true }).fill('Automated test — not a real reviewer');
  await page.getByLabel('Review date', { exact: true }).fill(today);
  await page.getByLabel('Review due', { exact: true }).fill(due);
  const claims = page.getByRole('group', { name: /^Claim \d+$/ });
  await expect(claims).toHaveCount(2);
  for (let i = 0; i < (await claims.count()); i++) {
    const claim = claims.nth(i);
    await claim
      .getByLabel('Source link', { exact: true })
      .fill('https://example.org/synthetic-test');
    await claim
      .getByLabel('Exact supporting passage or page', { exact: true })
      .fill('Synthetic test fixture');
    await claim
      .getByLabel('Effective date or why not applicable', { exact: true })
      .fill('Test only');
    await claim.getByLabel('Date actually retrieved', { exact: true }).fill(today);
    await claim.getByRole('checkbox').check();
  }
  await page.getByRole('button', { name: 'Record reviewed', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved reviewed record' })).toBeVisible();
  await page.getByRole('button', { name: 'Record approval', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved approved record' })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/APPROVED — local record by Automated test/)).toBeVisible();
});

test('blocked local progress does not claim that completion was saved', async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('openmaic.learning-progress'))
        throw new DOMException('Synthetic storage limit', 'QuotaExceededError');
      return set.call(this, key, value);
    };
  });
  await page.goto('/learn/asx-foundations');
  await expect(
    page.getByRole('status').filter({ hasText: 'progress cannot be saved' }),
  ).toBeVisible();
  await page.getByLabel('No. Inspect its mandate, holdings and structure.').check();
  await page.getByLabel('Define the objective, constraints and realistic alternative.').check();
  await page.getByLabel('The required access date and ability to withstand a shortfall.').check();
  await page.getByRole('button', { name: 'Check answers', exact: true }).click();
  await page.getByRole('button', { name: 'Mark lesson complete', exact: true }).click();
  await expect(page.getByText('Lesson marked complete on this device.')).toHaveCount(0);
});

test('home and lesson pass automated accessibility checks in light and dark themes', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme as 'light' | 'dark', reducedMotion: 'reduce' });
    for (const path of ['/', '/learn', '/learn/asx-foundations']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations,
        `${theme} ${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((node) => node.target) })))}`,
      ).toEqual([]);
    }
  }
});

test('learner pages reflow at an effective 200 percent laptop zoom', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 400 });
  for (const path of ['/', '/learn', '/learn/fees']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('production health and bundled CSS/JS genuinely load', async ({ page, request }, testInfo) => {
  const health = await request.get('/api/health');
  expect(await health.json()).toMatchObject({
    service: 'openmaic',
    version: '1.0.0',
    check: 'liveness',
  });
  const failedAssets: string[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/_next/static/') && !response.ok())
      failedAssets.push(response.url());
  });
  await page.goto('/learn');
  await expect(page.getByLabel('Loss (%)', { exact: true })).toBeVisible();
  await page.getByLabel('Loss (%)', { exact: true }).fill('50');
  await expect(page.locator('output')).toContainText('100%');
  expect(failedAssets).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('learning-library-desktop.png') });
});

test('storage failure is visible, preserves the page and offers non-destructive retry', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (name, version) {
      if (name === 'maic-documents')
        throw new DOMException('Storage blocked for this isolated test', 'SecurityError');
      return original.call(this, name, version);
    };
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Saved classrooms could not be loaded' }),
  ).toBeVisible();
  await expect(page.getByText(/This does not mean they were deleted/)).toBeVisible();
  await page.getByRole('button', { name: 'Retry saved classrooms', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Saved classrooms could not be loaded' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Read the built-in lessons/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Investment Learning Library');
});
