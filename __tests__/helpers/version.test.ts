import { describe, expect, it } from 'vitest';
import {
  getTodayVersionPrefix,
  getNextVersion,
  normalizeVersion,
} from '@/lib/helpers/version';

describe('version helpers', () => {
  it('normalizes VERSION file contents', () => {
    expect(normalizeVersion(' v2026.03.19.2 \n')).toBe('v2026.03.19.2');
  });

  it('formats the daily release prefix', () => {
    expect(getTodayVersionPrefix(new Date('2026-03-19T10:00:00+01:00'))).toBe('v2026.03.19');
  });

  it('returns the first release version for a given day', () => {
    expect(getNextVersion('v2026.03.18.2', new Date('2026-03-19T10:00:00+01:00'))).toBe('v2026.03.19');
  });

  it('increments the release suffix for the second release of the day', () => {
    expect(getNextVersion('v2026.03.19', new Date('2026-03-19T10:00:00+01:00'))).toBe('v2026.03.19.2');
  });

  it('increments the release suffix for later releases on the same day', () => {
    expect(getNextVersion('v2026.03.19.2', new Date('2026-03-19T10:00:00+01:00'))).toBe('v2026.03.19.3');
  });
});
