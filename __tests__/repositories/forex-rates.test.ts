import { beforeEach, describe, expect, it, vi } from 'vitest';

const lookupMock = vi.fn();

vi.mock('node:dns/promises', () => ({
  lookup: lookupMock,
}));

describe('resolveBrowserEndpoint', () => {
  beforeEach(() => {
    lookupMock.mockReset();
    vi.restoreAllMocks();
  });

  it('resolves docker hostnames to an IP before calling /json/version', async () => {
    lookupMock.mockResolvedValue({
      address: '172.18.0.2',
      family: 4,
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = input instanceof URL ? input : new URL(String(input));

        if (url.hostname === 'chromium') {
          return new Response('bad host', { status: 500 });
        }

        return new Response(
          JSON.stringify({
            webSocketDebuggerUrl: 'ws://0.0.0.0:9222/devtools/browser/test-id',
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          },
        );
      });

    const { resolveBrowserEndpoint } = await import('@/lib/repositories/forex-rates');

    await expect(resolveBrowserEndpoint('http://chromium:9222')).resolves.toBe(
      'ws://172.18.0.2:9222/devtools/browser/test-id',
    );
    expect(fetchMock).toHaveBeenCalledWith(new URL('http://172.18.0.2:9222/json/version'));
  });

  it('passes websocket endpoints through unchanged', async () => {
    const { resolveBrowserEndpoint } = await import('@/lib/repositories/forex-rates');

    await expect(
      resolveBrowserEndpoint('ws://chromium:9222/devtools/browser/test-id'),
    ).resolves.toBe('ws://chromium:9222/devtools/browser/test-id');
  });
});
