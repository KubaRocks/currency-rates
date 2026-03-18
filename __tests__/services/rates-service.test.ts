import { describe, expect, it, vi } from 'vitest';
import { createRatesService } from '@/lib/repositories/rates-service';
import type { CurrencyCode, ExternalRate, RatesResponse, SourceStatus } from '@/types';

interface SourceResult {
  rates: ExternalRate[];
  source: SourceStatus;
}

describe('rates service', () => {
  const symbols: CurrencyCode[] = ['USD', 'EUR'];

  it('returns a fresh merged payload and stores it as the latest success', async () => {
    const setLatestPayload = vi.fn();
    const service = createRatesService({
      getNbpRates: async () => ({
        rates: [
          { code: 'USD', rate: 4.2 },
          { code: 'EUR', rate: 4.5 },
        ],
        source: 'fresh',
      }),
      getForexRates: async () => ({
        rates: [
          { code: 'USD', rate: 4.3 },
          { code: 'EUR', rate: 4.6 },
        ],
        source: 'fresh',
      }),
      getLatestPayload: () => null,
      setLatestPayload,
      now: () => new Date('2026-03-18T12:00:00.000Z'),
    });

    const payload = await service.getRates(symbols);

    expect(payload).toEqual({
      rates: [
        { code: 'USD', nbpRate: 4.2, forexRate: 4.3 },
        { code: 'EUR', nbpRate: 4.5, forexRate: 4.6 },
      ],
      stale: false,
      updatedAt: '2026-03-18T12:00:00.000Z',
      sources: {
        nbp: 'fresh',
        forex: 'fresh',
      },
    });
    expect(setLatestPayload).toHaveBeenCalledWith(payload);
  });

  it('returns the last successful payload as stale when forex fails', async () => {
    const latestPayload: RatesResponse = {
      rates: [
        { code: 'USD', nbpRate: 4.2, forexRate: 4.3 },
        { code: 'EUR', nbpRate: 4.5, forexRate: 4.6 },
      ],
      stale: false,
      updatedAt: '2026-03-18T11:50:00.000Z',
      sources: {
        nbp: 'fresh',
        forex: 'fresh',
      },
    };

    const service = createRatesService({
      getNbpRates: async () => ({
        rates: [
          { code: 'USD', rate: 4.21 },
          { code: 'EUR', rate: 4.51 },
        ],
        source: 'fresh',
      }),
      getForexRates: async () => ({
        rates: [],
        source: 'failed',
      }),
      getLatestPayload: () => latestPayload,
      setLatestPayload: vi.fn(),
      now: () => new Date('2026-03-18T12:00:00.000Z'),
    });

    const payload = await service.getRates(symbols);

    expect(payload).toEqual({
      ...latestPayload,
      stale: true,
      sources: {
        nbp: 'fresh',
        forex: 'failed',
      },
    });
  });

  it('returns a failed empty payload when no source data or fallback is available', async () => {
    const service = createRatesService({
      getNbpRates: async (): Promise<SourceResult> => ({
        rates: [],
        source: 'failed',
      }),
      getForexRates: async (): Promise<SourceResult> => ({
        rates: [],
        source: 'failed',
      }),
      getLatestPayload: () => null,
      setLatestPayload: vi.fn(),
      now: () => new Date('2026-03-18T12:00:00.000Z'),
    });

    await expect(service.getRates(symbols)).resolves.toEqual({
      rates: [],
      stale: false,
      updatedAt: null,
      sources: {
        nbp: 'failed',
        forex: 'failed',
      },
    });
  });
});
