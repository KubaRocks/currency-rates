import { getLatestRatesPayload, setLatestRatesPayload } from '@/lib/cache';
import { buildRatesResponse } from '@/lib/helpers/validators';
import { getForexRates } from '@/lib/repositories/forex-rates';
import { getNbpRates } from '@/lib/repositories/nbp-rates';
import type { CurrencyCode, Rate, RatesResponse, RatesSourceResult } from '@/types';

interface RatesServiceDeps {
  getNbpRates: (symbols: CurrencyCode[]) => Promise<RatesSourceResult>;
  getForexRates: (symbols: CurrencyCode[]) => Promise<RatesSourceResult>;
  getLatestPayload: () => RatesResponse | null;
  setLatestPayload: (payload: RatesResponse) => RatesResponse;
  now?: () => Date;
}

export function createRatesService(deps: Partial<RatesServiceDeps> = {}) {
  const {
    getNbpRates: loadNbpRates = getNbpRates,
    getForexRates: loadForexRates = getForexRates,
    getLatestPayload = getLatestRatesPayload,
    setLatestPayload = setLatestRatesPayload,
    now = () => new Date(),
  } = deps;

  return {
    async getRates(symbols: CurrencyCode[]) {
      const [nbp, forex] = await Promise.all([
        loadNbpRates(symbols),
        loadForexRates(symbols),
      ]);

      const mergedRates = mergeRates(symbols, nbp, forex);

      if (mergedRates.length === symbols.length) {
        const payload = buildRatesResponse({
          rates: mergedRates,
          stale: false,
          updatedAt: now().toISOString(),
          sources: {
            nbp: nbp.source,
            forex: forex.source,
          },
        });

        setLatestPayload(payload);

        return payload;
      }

      const latestPayload = getLatestPayload();

      if (latestPayload) {
        return {
          ...latestPayload,
          stale: true,
          sources: {
            nbp: nbp.source,
            forex: forex.source,
          },
        };
      }

      return buildRatesResponse({
        sources: {
          nbp: nbp.source,
          forex: forex.source,
        },
      });
    },
  };
}

function mergeRates(
  symbols: CurrencyCode[],
  nbp: RatesSourceResult,
  forex: RatesSourceResult,
): Rate[] {
  return symbols
    .map((symbol) => {
      const nbpRate = nbp.rates.find((rate) => rate.code === symbol);
      const forexRate = forex.rates.find((rate) => rate.code === symbol);

      if (!nbpRate || !forexRate) {
        return null;
      }

      return {
        code: symbol,
        nbpRate: nbpRate.rate,
        forexRate: forexRate.rate,
      };
    })
    .filter((rate): rate is Rate => rate !== null);
}
