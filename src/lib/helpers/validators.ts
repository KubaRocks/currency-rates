import type { CurrencyCode, Rate, RatesResponse, SourceStatus } from '@/types';

const SUPPORTED_CODES: CurrencyCode[] = ['USD', 'EUR'];
const SUPPORTED_STATUSES: SourceStatus[] = ['fresh', 'cached', 'failed'];

export function validateRatesResponse(response: unknown): response is RatesResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const payload = response as Partial<RatesResponse>;

  if (!Array.isArray(payload.rates) || payload.rates.length === 0) {
    return false;
  }

  if (typeof payload.stale !== 'boolean') {
    return false;
  }

  if (payload.updatedAt !== null && typeof payload.updatedAt !== 'string') {
    return false;
  }

  if (!payload.sources || typeof payload.sources !== 'object') {
    return false;
  }

  if (
    !SUPPORTED_STATUSES.includes(payload.sources.nbp as SourceStatus) ||
    !SUPPORTED_STATUSES.includes(payload.sources.forex as SourceStatus)
  ) {
    return false;
  }

  return payload.rates.every(isValidRate);
}

export function buildRatesResponse(overrides: Partial<RatesResponse> = {}): RatesResponse {
  return {
    rates: overrides.rates ?? [],
    stale: overrides.stale ?? false,
    updatedAt: overrides.updatedAt ?? null,
    sources: overrides.sources ?? {
      nbp: 'failed',
      forex: 'failed',
    },
  };
}

function isValidRate(rate: Rate): boolean {
  return Boolean(
    SUPPORTED_CODES.includes(rate.code) &&
      typeof rate.nbpRate === 'number' &&
      rate.nbpRate > 0 &&
      typeof rate.forexRate === 'number' &&
      rate.forexRate > 0,
  );
}
