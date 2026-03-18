import dayjs from 'dayjs';
import {
  formatNbpDate,
  getPreviousBusinessDay,
  getSecondsUntilEndOfDay,
} from '@/lib/helpers/dates';
import { logger } from '@/lib/logger';
import type { CurrencyCode, RatesSourceResult } from '@/types';

interface NbpTableResponse {
  rates: Array<{
    code: CurrencyCode;
    mid: number;
  }>;
}

const BASE_URL = 'https://api.nbp.pl/api/exchangerates';

export async function getNbpRates(symbols: CurrencyCode[]): Promise<RatesSourceResult> {
  let date = getPreviousBusinessDay();
  let attempts = 0;

  while (attempts < 7) {
    const url = `${BASE_URL}/tables/A/${formatNbpDate(date)}?format=json`;

    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        next: {
          revalidate: getSecondsUntilEndOfDay(),
        },
      });

      if (response.status === 404) {
        date = dayjs(date).subtract(1, 'day').toDate();
        attempts += 1;
        continue;
      }

      if (!response.ok) {
        logger.error(`[nbp] API responded with ${response.status}`);
        return { rates: [], source: 'failed' };
      }

      const data = (await response.json()) as NbpTableResponse[];
      const table = data[0];

      return {
        rates: table.rates
          .filter((rate) => symbols.includes(rate.code))
          .map((rate) => ({
            code: rate.code,
            rate: rate.mid,
          })),
        source: 'fresh',
      };
    } catch (error) {
      logger.error(`[nbp] API call failed: ${String(error)}`);
      return { rates: [], source: 'failed' };
    }
  }

  return { rates: [], source: 'failed' };
}
