import { describe, expect, test, vi } from 'vitest';

import { ACCESS_TOKEN_TTL_MS } from '@/lib/access-token-policy';
import { createAccessToken, verifyAccessToken } from '@/lib/server/access-token';

describe('access token signing', () => {
  test('verifies tokens signed with the same access code', () => {
    vi.setSystemTime(new Date('2026-06-25T00:00:00Z'));

    const token = createAccessToken('demo-code');

    expect(verifyAccessToken(token, 'demo-code')).toBe(true);
    expect(verifyAccessToken(token, 'other-code')).toBe(false);
    expect(verifyAccessToken(`${token}invalid-hex-suffix`, 'demo-code')).toBe(false);
    expect(verifyAccessToken('bad-token', 'demo-code')).toBe(false);

    vi.useRealTimers();
  });

  test('rejects expired and implausibly future-dated tokens', () => {
    const issuedAt = new Date('2026-06-25T00:00:00Z');
    vi.setSystemTime(issuedAt);
    const token = createAccessToken('demo-code');

    expect(verifyAccessToken(token, 'demo-code', issuedAt.getTime() + ACCESS_TOKEN_TTL_MS)).toBe(
      true,
    );
    expect(
      verifyAccessToken(token, 'demo-code', issuedAt.getTime() + ACCESS_TOKEN_TTL_MS + 1),
    ).toBe(false);

    const futureToken = createAccessToken('demo-code');
    expect(verifyAccessToken(futureToken, 'demo-code', issuedAt.getTime() - 6 * 60 * 1000)).toBe(
      false,
    );

    vi.useRealTimers();
  });

  test('rejects non-numeric and unsafe timestamps before signature comparison', () => {
    expect(verifyAccessToken('not-a-time.00', 'demo-code')).toBe(false);
    expect(verifyAccessToken('999999999999999999999.00', 'demo-code')).toBe(false);
  });
});
