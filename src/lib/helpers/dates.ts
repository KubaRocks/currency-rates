import dayjs from 'dayjs';

const NBP_DATE_FORMAT = 'YYYY-MM-DD';
const CACHE_DATE_FORMAT = 'YYYYMMDD';

export function formatNbpDate(date: Date): string {
  return dayjs(date).format(NBP_DATE_FORMAT);
}

export function formatCacheDate(date: Date): string {
  return dayjs(date).format(CACHE_DATE_FORMAT);
}

export function getPreviousBusinessDay(from: Date = new Date()): Date {
  let current = dayjs(from).subtract(1, 'day');

  while (current.day() === 0 || current.day() === 6) {
    current = current.subtract(1, 'day');
  }

  return current.toDate();
}

export function getSecondsUntilEndOfDay(from: Date = new Date()): number {
  const endOfDay = dayjs(from).endOf('day');
  const diffMs = endOfDay.diff(dayjs(from), 'millisecond');

  return Math.max(1, Math.floor(diffMs / 1000));
}
