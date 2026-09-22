import { defineConfig, devices } from '@playwright/test';

// Production-bundle acceptance test in an isolated browser. No personal profile,
// real API key, live model generation or learner database is used.
export default defineConfig({
  testDir: './e2e/tests',
  testMatch: 'pilot-acceptance.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3003',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node .next/standalone/server.js',
    url: 'http://127.0.0.1:3003/api/health',
    reuseExistingServer: false,
    env: { PORT: '3003', HOSTNAME: '127.0.0.1', NODE_ENV: 'production', ACCESS_CODE: '' },
    timeout: 120_000,
  },
});
