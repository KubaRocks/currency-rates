export type CurrencyCode = 'USD' | 'EUR';

export type SourceStatus = 'fresh' | 'cached' | 'failed';

export interface ExternalRate {
  code: CurrencyCode;
  rate: number;
}

export interface RatesSourceResult {
  rates: ExternalRate[];
  source: SourceStatus;
}

export interface Rate {
  code: CurrencyCode;
  nbpRate: number;
  forexRate: number;
}

export interface RatesResponse {
  rates: Rate[];
  stale: boolean;
  updatedAt: string | null;
  sources: {
    nbp: SourceStatus;
    forex: SourceStatus;
  };
}

export interface VersionResponse {
  version: string;
}
