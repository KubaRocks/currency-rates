import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startPolling } from '@/lib/helpers/polling';

describe('startPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('runs each refresh once immediately and then only on its own interval', async () => {
    const refreshRates = vi.fn(async () => {});
    const refreshVersion = vi.fn(async () => {});

    const stop = startPolling({
      refreshRates,
      refreshVersion,
      ratesIntervalMs: 10_000,
      versionIntervalMs: 60_000,
    });

    expect(refreshRates).toHaveBeenCalledTimes(1);
    expect(refreshVersion).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(9_999);
    expect(refreshRates).toHaveBeenCalledTimes(1);
    expect(refreshVersion).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(refreshRates).toHaveBeenCalledTimes(2);
    expect(refreshVersion).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50_000);
    expect(refreshRates).toHaveBeenCalledTimes(7);
    expect(refreshVersion).toHaveBeenCalledTimes(2);

    stop();
    vi.advanceTimersByTime(60_000);
    expect(refreshRates).toHaveBeenCalledTimes(7);
    expect(refreshVersion).toHaveBeenCalledTimes(2);
  });
});
