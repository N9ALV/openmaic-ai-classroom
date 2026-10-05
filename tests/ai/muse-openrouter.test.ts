import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getModel } from '@/lib/ai/providers';
import { callLLM } from '@/lib/ai/llm';
import { getCatalogThinkingCapability } from '@/lib/ai/model-metadata';
import { normalizeThinkingConfig } from '@/lib/ai/thinking-config';

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));
vi.mock('@/lib/server/usage-storage', () => ({ recordUsage: vi.fn(async () => undefined) }));

const modelId = 'meta/muse-spark-1.3-contributor';

describe('Muse Spark Contributor through OpenRouter', () => {
  beforeEach(() => vi.stubEnv('LLM_THINKING_DISABLED', ''));
  afterEach(() => vi.unstubAllEnvs());

  it('offers supported effort controls without an unsupported Off setting', () => {
    const thinking = getCatalogThinkingCapability('openrouter', modelId);
    expect(thinking).toMatchObject({ toggleable: false, defaultEffort: 'medium' });
    expect(normalizeThinkingConfig(thinking, { mode: 'disabled' })).toEqual({
      mode: 'enabled',
      effort: 'minimal',
    });
  });

  it.each([false, true])(
    'sends a valid minimum effort with best-effort disabling (global=%s)',
    async (global) => {
      if (global) vi.stubEnv('LLM_THINKING_DISABLED', 'true');
      let wireBody: Record<string, unknown> | undefined;
      const transport: typeof fetch = async (_input, init) => {
        wireBody = JSON.parse(String(init?.body));
        return Response.json({
          id: 'chatcmpl-synthetic',
          object: 'chat.completion',
          created: 1,
          model: modelId,
          choices: [
            { index: 0, message: { role: 'assistant', content: 'OK' }, finish_reason: 'stop' },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 1, total_tokens: 11 },
        });
      };
      const { model } = getModel({
        providerId: 'openrouter',
        modelId,
        apiKey: 'synthetic-test-key',
        fetchImpl: transport,
      });
      const result = await callLLM(
        { model, prompt: 'Say OK.', maxOutputTokens: 1024 },
        'synthetic-muse-test',
        undefined,
        global ? undefined : { mode: 'disabled' },
      );

      expect(result.text).toBe('OK');
      expect(wireBody?.model).toBe(modelId);
      expect(wireBody?.reasoning).toEqual({ enabled: true, effort: 'minimal' });
    },
  );
});
