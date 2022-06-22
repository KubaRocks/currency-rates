import { Rate } from "../types";

export function validateRateResponse(response: Rate[]): boolean {
  if (!response.length) {
    return false;
  }

  return response.every((rate) => rate.code
    && rate.nbpRate
    && rate.nbpRate > 0
    && rate.forexRate
    && rate.forexRate > 0
  );
}
