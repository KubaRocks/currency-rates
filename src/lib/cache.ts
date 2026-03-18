import type { RatesResponse } from '@/types';

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();
let latestPayload: RatesResponse | null = null;

export function getCacheValue<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCacheValue<T>(key: string, value: T, ttlSeconds: number): T {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  return value;
}

export function getLatestRatesPayload(): RatesResponse | null {
  return latestPayload;
}

export function setLatestRatesPayload(payload: RatesResponse): RatesResponse {
  latestPayload = payload;
  return latestPayload;
}
