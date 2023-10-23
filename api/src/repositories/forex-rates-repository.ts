import "isomorphic-fetch";
import puppeteer, { Page } from "puppeteer";
import NodeCache from "node-cache";
const dns = require('dns').promises;
import { ExternalRate, ExternalRatesRepository } from "types";
import { formatDayDate, getSecondsUntilTheEndOfTheDay } from "../helpers/dates";
import { Logger } from "../logger";

export function ForexRatesRepository(cache: NodeCache): ExternalRatesRepository {
  const baseUrl = 'https://s.tradingview.com/embed-widget/tickers/?locale=en#';

  async function findBySymbols(symbols: string[]): Promise<ExternalRate[]> {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const url = `${baseUrl}${encodeURIComponent(JSON.stringify(generateConfig(symbols)))}`;

    Logger.info('[forex] - Retrieving rates from API')

    await page.goto(url, { waitUntil: 'networkidle2' });
    try {
      await page.waitForSelector('.js-symbol-last');

      let rates = await scrapeRatesFromPage(page);
      const cacheKey = `forex-${formatDayDate(new Date())}`;

      if (!rates.every((rate) => Number(rate) !== 0)) {
        Logger.error('[forex] - No rates found for symbols');
        cache.has(cacheKey)
          ? Logger.info('[forex] - Retrieving rates from cache')
          : Logger.info('[forex] - Recrawling');

        rates = cache.has(cacheKey)
          ? cache.get(cacheKey)!
          : await scrapeRatesFromPage(page);
      }

      const results = symbols.map((symbol, index) => {
        return {
          code: symbol,
          rate: Number(rates[index]),
        }
      });

      cache.set(cacheKey, results, getSecondsUntilTheEndOfTheDay());

      await page.close();

      return results;
    } catch (e) {
      Logger.error('🔥 [forex] - Error while scraping rates', e);
      await page.close();
      return [];
    }
  }

  function scrapeRatesFromPage(page: Page) {
    return page.$$eval('.js-symbol-last', (nodes) => nodes.map((n) => n.innerHTML));
  }

  async function getChromiumEndpoint(): Promise<string> {
    const { address } = await dns.lookup("chromium", {
      family: 4,
      hints: dns.ADDRCONFIG,
    });

    const response = await fetch(`http://${address}:9222/json/version`);
    const data = await response.json();

    return data.webSocketDebuggerUrl;
  }

  async function getBrowser() {
    return process.env.CHROMIUM_URL
      ? puppeteer.connect({ browserWSEndpoint: await getChromiumEndpoint() })
      : puppeteer.launch({ headless: true });
  }

  function generateConfig(currencies: string[]) {
    return {
      symbols: currencies.map((symbol) => {
        return {
          proName: `FOREXCOM:${symbol.toUpperCase()}PLN`,
          title: symbol.toUpperCase(),
        }
      }),
    }
  }

  return { findBySymbols };
}
