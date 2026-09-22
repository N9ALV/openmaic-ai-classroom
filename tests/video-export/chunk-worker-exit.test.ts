import { afterEach, describe, expect, it, vi } from 'vitest';
import { finishWorker } from '../../render-service/src/worker-result';

describe('render worker termination', () => {
  afterEach(() => vi.useRealTimers());
  it.each([0, 1])('flushes the result before exiting with %s', (code) => {
    vi.useFakeTimers();
    let callback: () => void = () => {};
    const exit = vi.fn() as unknown as NodeJS.Process['exit'];
    const send = vi.fn((_result, cb) => {
      callback = cb;
      return true;
    }) as unknown as NodeJS.Process['send'];
    finishWorker({ ok: code === 0 }, code, { exit, send });
    expect(exit).not.toHaveBeenCalled();
    callback();
    vi.runAllTimers();
    expect(exit).toHaveBeenCalledExactlyOnceWith(code);
  });
  it('exits even when IPC never acknowledges or has disconnected', () => {
    vi.useFakeTimers();
    const exit = vi.fn() as unknown as NodeJS.Process['exit'];
    const send = vi.fn(() => true) as unknown as NodeJS.Process['send'];
    finishWorker({}, 1, { exit, send });
    vi.advanceTimersByTime(5_000);
    expect(exit).toHaveBeenCalledExactlyOnceWith(1);
  });
});
