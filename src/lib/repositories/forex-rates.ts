import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import puppeteer from 'puppeteer';
import { getCacheValue, setCacheValue } from '@/lib/cache';
import { formatCacheDate, getSecondsUntilEndOfDay } from '@/lib/helpers/dates';
import { logger } from '@/lib/logger';
import type { CurrencyCode, ExternalRate, RatesSourceResult } from '@/types';

const BASE_URL = 'https://s.tradingview.com/embed-widget/tickers/?locale=en#';

export async function getForexRates(symbols: CurrencyCode[]): Promise<RatesSourceResult> {
  const cacheKey = `forex-${formatCacheDate(new Date())}`;
  const cachedRates = getCacheValue<ExternalRate[]>(cacheKey);

  if (cachedRates) {
    return {
      rates: cachedRates.filter((rate) => symbols.includes(rate.code)),
      source: 'cached',
    };
  }

  let browser: Awaited<ReturnType<typeof puppeteer.connect>> | null = null;
  let page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.connect>>['newPage']>> | null = null;

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(getTradingViewUrl(symbols), {
      waitUntil: 'networkidle2',
    });
    await page.waitForSelector('.js-symbol-last', {
      timeout: 10_000,
    });

    const rawRates = await page.$$eval('.js-symbol-last', (nodes) =>
      nodes.map((node) => node.textContent ?? '0'),
    );

    if (!rawRates.length || rawRates.some((rate) => Number(rate) === 0)) {
      logger.error('[forex] Invalid rates returned from TradingView');
      return { rates: [], source: 'failed' };
    }

    const rates = symbols.map((symbol, index) => ({
      code: symbol,
      rate: Number(rawRates[index]),
    }));

    setCacheValue(cacheKey, rates, getSecondsUntilEndOfDay());

    return {
      rates,
      source: 'fresh',
    };
  } catch (error) {
    logger.error(`🔥 [forex] Error while scraping rates: ${String(error)}`);
    return { rates: [], source: 'failed' };
  } finally {
    await page?.close();
    await browser?.close();
  }
}

async function getBrowser() {
  const browserWSEndpoint = await resolveBrowserEndpoint(
    process.env.CHROMIUM_URL ?? 'http://chromium:9222',
  );

  return puppeteer.connect({ browserWSEndpoint });
}

export async function resolveBrowserEndpoint(endpoint: string) {
  if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
    return endpoint;
  }

  const browserUrl = await resolveBrowserHttpUrl(endpoint);
  const response = await fetch(new URL('/json/version', browserUrl));

  if (!response.ok) {
    throw new Error(`Chromium endpoint responded with ${response.status}`);
  }

  const data = (await response.json()) as { webSocketDebuggerUrl?: string };

  if (!data.webSocketDebuggerUrl) {
    throw new Error('Chromium endpoint did not provide a webSocketDebuggerUrl');
  }

  return normalizeBrowserWebSocketUrl(data.webSocketDebuggerUrl, browserUrl);
}

async function resolveBrowserHttpUrl(endpoint: string) {
  const url = new URL(endpoint);

  if (isReachableHost(url.hostname)) {
    return url;
  }

  const { address } = await lookup(url.hostname, {
    family: 4,
  });

  url.hostname = address;

  return url;
}

function normalizeBrowserWebSocketUrl(browserWSEndpoint: string, browserUrl: URL) {
  const url = new URL(browserWSEndpoint);

  if (isWildcardOrLoopbackHost(url.hostname)) {
    url.hostname = browserUrl.hostname;
  }

  return url.toString();
}

function isReachableHost(hostname: string) {
  return isIP(hostname) !== 0 || hostname === 'localhost';
}

function isWildcardOrLoopbackHost(hostname: string) {
  return hostname === '0.0.0.0' || hostname === '127.0.0.1' || hostname === 'localhost';
}

function getTradingViewUrl(symbols: CurrencyCode[]) {
  const config = {
    symbols: symbols.map((symbol) => ({
      proName: `FOREXCOM:${symbol}PLN`,
      title: symbol,
    })),
  };

  return `${BASE_URL}${encodeURIComponent(JSON.stringify(config))}`;
}
