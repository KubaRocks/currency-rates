import { beforeEach, describe, expect, it, vi } from 'vitest';

const readVersionFile = vi.fn();

vi.mock('@/lib/helpers/version', async () => {
  const actual = await vi.importActual<typeof import('@/lib/helpers/version')>('@/lib/helpers/version');

  return {
    ...actual,
    readVersionFile,
  };
});

describe('version route', () => {
  beforeEach(() => {
    readVersionFile.mockReset();
  });

  it('returns the current application version with no-store caching', async () => {
    readVersionFile.mockResolvedValue('v2026.03.19.2');

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      version: 'v2026.03.19.2',
    });
  });

  it('returns a 500 response when the VERSION file cannot be read', async () => {
    readVersionFile.mockRejectedValue(new Error('missing VERSION'));

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: 'Unable to read application version',
    });
  });
});
