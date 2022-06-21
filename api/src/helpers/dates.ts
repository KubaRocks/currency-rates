import dayjs from "dayjs";

export function formatDayDate(date: Date): string {
  return dayjs(date).format('YYYYMMDD');
}

export function getSecondsUntilTheEndOfTheDay(): number {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return endOfDay.getTime() - now.getTime();
}
