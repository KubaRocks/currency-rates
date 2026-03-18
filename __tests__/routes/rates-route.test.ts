import { beforeEach, describe, expect, it, vi } from 'vitest';

const getRates = vi.fn();

vi.mock('@/lib/repositories/rates-service', () => ({
  createRatesService: () => ({
    getRates,
  }),
}));

describe('rates route', () => {
  beforeEach(() => {
    getRates.mockReset();
  });

  it('rejects unsupported symbols', async () => {
    const { GET } = await import('@/app/api/rates/[symbols]/route');
    const response = await GET(new Request('http://localhost/api/rates/USD,GBP'), {
      params: Promise.resolve({ symbols: 'USD,GBP' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Unsupported symbols provided',
    });
  });

  it('returns the merged payload for supported symbols', async () => {
    getRates.mockResolvedValue({
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

    const { GET } = await import('@/app/api/rates/[symbols]/route');
    const response = await GET(new Request('http://localhost/api/rates/USD,EUR'), {
      params: Promise.resolve({ symbols: 'USD,EUR' }),
    });

    expect(getRates).toHaveBeenCalledWith(['USD', 'EUR']);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
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
  });
});
