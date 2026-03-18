import { describe, expect, it } from 'vitest';
import {
  formatCacheDate,
  formatNbpDate,
  getPreviousBusinessDay,
  getSecondsUntilEndOfDay,
} from '@/lib/helpers/dates';

describe('date helpers', () => {
  it('formats cache keys as yyyymmdd', () => {
    expect(formatCacheDate(new Date('2026-03-18T12:00:00+01:00'))).toBe('20260318');
  });

  it('formats nbp dates as yyyy-mm-dd', () => {
    expect(formatNbpDate(new Date('2026-03-18T12:00:00+01:00'))).toBe('2026-03-18');
  });

  it('moves monday back to friday for business day lookup', () => {
    expect(formatNbpDate(getPreviousBusinessDay(new Date('2026-03-16T12:00:00+01:00')))).toBe('2026-03-13');
  });

  it('moves sunday back to friday for business day lookup', () => {
    expect(formatNbpDate(getPreviousBusinessDay(new Date('2026-03-15T12:00:00+01:00')))).toBe('2026-03-13');
  });

  it('returns remaining whole seconds until end of day', () => {
    expect(getSecondsUntilEndOfDay(new Date('2026-03-18T23:59:58+01:00'))).toBe(1);
  });
});
