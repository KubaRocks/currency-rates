import { describe, expect, it } from 'vitest';
import {
  buildRatesResponse,
  validateRatesResponse,
} from '@/lib/helpers/validators';
import type { RatesResponse } from '@/types';

describe('validators', () => {
  it('rejects empty payloads', () => {
    const payload: RatesResponse = {
      rates: [],
      stale: false,
      updatedAt: null,
      sources: {
        nbp: 'fresh',
        forex: 'fresh',
      },
    };

    expect(validateRatesResponse(payload)).toBe(false);
  });

  it('accepts valid stale payloads', () => {
    const payload: RatesResponse = {
      rates: [
        { code: 'USD', nbpRate: 4.2, forexRate: 4.3 },
        { code: 'EUR', nbpRate: 4.5, forexRate: 4.6 },
      ],
      stale: true,
      updatedAt: '2026-03-18T12:00:00.000Z',
      sources: {
        nbp: 'cached',
        forex: 'failed',
      },
    };

    expect(validateRatesResponse(payload)).toBe(true);
  });

  it('builds a default failed response', () => {
    expect(buildRatesResponse()).toEqual({
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
