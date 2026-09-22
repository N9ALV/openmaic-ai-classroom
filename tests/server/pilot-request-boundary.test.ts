import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { createAccessToken } from '@/lib/server/access-token';
import { ACCESS_TOKEN_TTL_MS } from '@/lib/access-token-policy';

describe('pilot request boundary', () => {
  beforeEach(() => vi.stubEnv('ACCESS_CODE', ''));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });
  it.each(['https://hostile.example', 'null', 'http://localhost:9999'])(
    'rejects mutation Origin %s even without an access code',
    async (origin) => {
      const response = await proxy(
        new NextRequest('http://localhost:3000/api/generate-classroom', {
          method: 'POST',
          headers: { origin },
        }),
      );
      expect(response.status).toBe(403);
    },
  );
  it('permits same-origin mutations but keeps the authentication gate', async () => {
    const request = () =>
      new NextRequest('http://localhost:3000/api/generate-classroom', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
      });
    expect((await proxy(request())).status).toBe(200);
    vi.stubEnv('ACCESS_CODE', 'test-only-access-code');
    expect((await proxy(request())).status).toBe(401);
  });
  it('checks expiry on actual protected requests', async () => {
    vi.stubEnv('ACCESS_CODE', 'test-only-access-code');
    const now = Date.now();
    vi.setSystemTime(now);
    const token = createAccessToken('test-only-access-code');
    const request = () =>
      new NextRequest('http://localhost:3000/api/server-providers', {
        headers: { cookie: `openmaic_access=${token}` },
      });
    expect((await proxy(request())).status).toBe(200);
    vi.setSystemTime(now + ACCESS_TOKEN_TTL_MS + 1);
    expect((await proxy(request())).status).toBe(401);
  });
});
