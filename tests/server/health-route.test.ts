import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/provider-config', () => ({
  getServerProviders: () => ({ openrouter: { models: ['example/free-model'] } }),
  getServerWebSearchProviders: () => ({}),
  getServerImageProviders: () => ({}),
  getServerVideoProviders: () => ({}),
  getServerTTSProviders: () => ({}),
}));

describe('health route', () => {
  it('reports the package version and server LLM capability', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      status: 'ok',
      version: '1.0.0',
      capabilities: { llm: true },
    });
  });
});
