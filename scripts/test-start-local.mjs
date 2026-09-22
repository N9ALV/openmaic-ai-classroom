import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOpenMAICHealth, nextArguments, probe, waitUntilReady } from './start-local.mjs';

test('health means this app, not just any 200 on port 3000', async () => {
  assert.equal(isOpenMAICHealth({ success: true, status: 'ok' }), false);
  assert.equal(isOpenMAICHealth({ service: 'other', success: true, status: 'ok' }), false);
  assert.equal(isOpenMAICHealth({ service: 'openmaic', success: true, status: 'ok' }), true);
  assert.equal(
    await probe(async () => ({ ok: true, json: async () => ({ status: 'ok' }) })),
    false,
  );
  assert.equal(
    await probe(async () => {
      throw new Error('offline');
    }),
    false,
  );
});
test('startup uses direct Node arguments, stable port and loopback only', () => {
  assert.deepEqual(nextArguments('cli.js'), [
    'cli.js',
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3000',
  ]);
});
test('readiness is bounded, sequential and detects child failure', async () => {
  let time = 0;
  let checks = 0;
  const ready = await waitUntilReady({
    now: () => time,
    delay: async (ms) => {
      time += ms;
    },
    timeout: 3000,
    check: async () => {
      checks++;
      return false;
    },
  });
  assert.equal(ready, false);
  assert.equal(checks, 3);
  assert.equal(await waitUntilReady({ alive: () => false, check: async () => true }), false);
  assert.equal(await waitUntilReady({ check: async () => true }), true);
});
