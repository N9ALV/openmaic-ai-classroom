export const ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ACCESS_TOKEN_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function isAccessTokenTimestampValid(timestamp: string, now = Date.now()): boolean {
  if (!/^\d+$/.test(timestamp)) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) return false;
  if (issuedAt > now + ACCESS_TOKEN_CLOCK_SKEW_MS) return false;

  return now - issuedAt <= ACCESS_TOKEN_TTL_MS;
}
