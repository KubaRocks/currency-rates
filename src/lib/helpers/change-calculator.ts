type TrendDirection = 'up' | 'down' | 'flat';

export function calculatePercentageChange(nbpRate: number, forexRate: number): number {
  if (nbpRate <= 0) {
    return 0;
  }

  return (forexRate - nbpRate) / nbpRate;
}

export function getTrendDirection(nbpRate: number, forexRate: number): TrendDirection {
  if (forexRate > nbpRate) {
    return 'up';
  }

  if (forexRate < nbpRate) {
    return 'down';
  }

  return 'flat';
}
