export interface ExternalRate {
  code: string;
  rate: number;
}

export interface Rate {
  code: string;
  nbpRate: number;
  forexRate: number;
}

export interface ExternalRatesRepository {
  findBySymbols(symbols: string[]): Promise<ExternalRate[]>;
}
