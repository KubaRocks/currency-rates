export function formatMoney(rate: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  }).format(rate);
}

export function formatPercentage(percent: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(percent);
}
