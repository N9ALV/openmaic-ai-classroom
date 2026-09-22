import { apiSuccess } from '@/lib/server/api-response';
import packageInfo from '@/package.json';
import {
  getServerProviders,
  getServerWebSearchProviders,
  getServerImageProviders,
  getServerVideoProviders,
  getServerTTSProviders,
} from '@/lib/server/provider-config';

const version = packageInfo.version;

export async function GET() {
  return apiSuccess({
    service: 'openmaic',
    check: 'liveness',
    status: 'ok',
    version,
    capabilities: {
      llm: Object.keys(getServerProviders()).length > 0,
      // A capability is available only when at least one provider is enabled —
      // force-disabled providers (disabled: true) do not count (#665).
      webSearch: Object.values(getServerWebSearchProviders()).some((info) => !info.disabled),
      imageGeneration: Object.values(getServerImageProviders()).some((info) => !info.disabled),
      videoGeneration: Object.values(getServerVideoProviders()).some((info) => !info.disabled),
      tts: Object.values(getServerTTSProviders()).some((info) => !info.disabled),
    },
  });
}
