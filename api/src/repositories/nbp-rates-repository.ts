import 'isomorphic-fetch';
import NodeCache from "node-cache";
import { FORMAT_NBP, getSecondsUntilTheEndOfTheDay, getYesterdayButWeekday } from "../helpers/dates";
import { ExternalRate, ExternalRatesRepository } from "types";

interface ApiRate {
  currency: string;
  code: string;
  mid: number;
}

export function NbpRatesRepository(cache: NodeCache): ExternalRatesRepository {
  const baseURL = 'http://api.nbp.pl/api/exchangerates';
  const ttl = getSecondsUntilTheEndOfTheDay();

  async function findAll(): Promise<ExternalRate[]> {
    const date = getYesterdayButWeekday();
    const cacheKey = `nbp-${date.format(FORMAT_NBP)}`;

    if (cache.has(cacheKey)) {
      console.log('[nbp] - Retrieving rates from cache');
      return await cache.get(cacheKey)!;
    }

    console.log('[nbp] - Retrieving rates from API');
    let data: any;
    let daysToSubtract = 1;

    do {
      data = await performApiCall(`tables/A/${date.subtract(daysToSubtract, 'day').format(FORMAT_NBP)}`);
      daysToSubtract++;
    } while(data.length === 0)

    const result = data[0].rates.map((rate: ApiRate) => {
      return {
        code: rate.code,
        rate: rate.mid,
      };
    });

    // store in cache till the end of a day
    cache.set(cacheKey, result, ttl);

    return result as ExternalRate[];
  }

  async function findBySymbols(symbols: string[]): Promise<ExternalRate[]> {
    const rates = await findAll()
    return rates.filter((rate) => symbols.includes(rate.code));
  }

  async function performApiCall(endpoint: string): Promise<any> {
    const url = `${baseURL}/${endpoint}?format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`[nbp] - API responded with ${response.status}`);
      return [];
    }


    return await response.json();
  }

  return { findBySymbols };
}
