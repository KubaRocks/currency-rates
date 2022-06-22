import dayjs from "dayjs";

export function formatDayDate(date: Date): string {
  return dayjs(date).format('YYYYMMDD');
}

export function getSecondsUntilTheEndOfTheDay(): number {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return endOfDay.getTime() - now.getTime();
}

export function getYesterdayButWeekday(): string {
  const format = 'YYYY-MM-DD';
  let yesterday = dayjs('yesterday');
  // sunday
  if (yesterday.day() === 0) {
    return yesterday.subtract(2, 'day').format(format);
  }
  // saturday
  if (yesterday.day() === 6) {
    return yesterday.subtract(1, 'day').format(format);
  }

  return yesterday.format(format);
}

