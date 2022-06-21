import { Request, Response } from "express";
import NodeCache from "node-cache";
import { NbpRatesRepository } from "../repositories/nbp-rates-repository";
import { ForexRatesRepository } from "../repositories/forex-rates-repository";

export async function rates(req: Request, res: Response, cache: NodeCache) {
  if (!req.params.symbols) {
    res.status(400).json({ message: "No symbols provided" });
  }
  const symbols = req.params.symbols
    .split(",")
    .map((symbol) => symbol.toUpperCase());
  const { findBySymbols: findNbpRates } = NbpRatesRepository(cache);
  const { findBySymbols: findForexRates } = ForexRatesRepository(cache);

  const nbpRates = await findNbpRates(symbols);
  const forexRates = await findForexRates(symbols);

  res.json(nbpRates.map((nbpRate) => {
    return {
      code: nbpRate.code,
      nbpRate: nbpRate.rate,
      forexRate: forexRates.find((forexRate) => forexRate.code === nbpRate.code)?.rate,
    };
  }));
}
