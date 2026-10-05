import { defineConfig } from '@playwright/test';
import baseline from './playwright.config';

// Run pilot and broader browser acceptance against the prepared standalone build.
// Build with NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true for the editor cases, then run
// scripts/prepare-standalone.mjs. The pilot config is the shorter smoke-test tier.
// Set OPENMAIC_STANDALONE_DIR to test a copied release outside the checkout.
export default defineConfig(baseline, {
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3003',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: process.env.OPENMAIC_STANDALONE_DIR
      ? 'node server.js'
      : 'node .next/standalone/server.js',
    cwd: process.env.OPENMAIC_STANDALONE_DIR,
    url: 'http://127.0.0.1:3003/api/health',
    reuseExistingServer: false,
    env: { PORT: '3003', HOSTNAME: '127.0.0.1', NODE_ENV: 'production', ACCESS_CODE: '' },
    timeout: 120_000,
  },
});
