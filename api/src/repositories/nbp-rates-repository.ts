import 'isomorphic-fetch';
import NodeCache from "node-cache";
import { formatDayDate, getSecondsUntilTheEndOfTheDay } from "../helpers/dates";
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
    const cacheKey = `nbp-${formatDayDate(new Date())}`;

    if (cache.has(cacheKey)) {
      return await cache.get(cacheKey)!;
    }

    const data = await performApiCall('tables/A');
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

    return await response.json();
  }

  return { findBySymbols };
}
