export const formatMoney = (rate: number): string =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  }).format(rate);

export const formatPercentage = (percent: number): string =>
  Intl.NumberFormat(
    'pl-PL',
    {
      style: 'percent',
      maximumFractionDigits: 2,
    })
    .format(percent);
