import { test as base } from '@playwright/test';
import { MockApi } from './mock-api';

type Fixtures = {
  mockApi: MockApi;
};

export const test = base.extend<Fixtures>({
  mockApi: async ({ page }, use) => {
    // Specific mocks registered below take precedence. Refuse every other
    // write so a missing mock cannot reach a live model or search provider.
    await page.route('**/api/**', async (route) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
        return route.fulfill({
          status: 503,
          json: { error: 'Unmocked API writes are forbidden in browser tests.' },
        });
      }
      return route.fallback();
    });
    const mockApi = new MockApi(page);
    // Always mock server-providers — called on every page load by root layout
    await mockApi.mockServerProviders();
    await use(mockApi);
  },
});

export { expect } from '@playwright/test';
