import { describe, expect, it } from 'vitest';
import {
  getNextVersionFromVersions,
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

  it('returns the first release of the day when there are no released versions for today', () => {
    expect(
      getNextVersionFromVersions(['v2026.03.18', 'v2026.03.18.2'], new Date('2026-03-19T10:00:00+01:00')),
    ).toBe('v2026.03.19');
  });

  it('returns the second release of the day when today already has a released base tag', () => {
    expect(
      getNextVersionFromVersions(['v2026.03.19'], new Date('2026-03-19T10:00:00+01:00')),
    ).toBe('v2026.03.19.2');
  });

  it('increments from the highest released suffix for today', () => {
    expect(
      getNextVersionFromVersions(
        ['v2026.03.19', 'v2026.03.19.2', 'v2026.03.19.4'],
        new Date('2026-03-19T10:00:00+01:00'),
      ),
    ).toBe('v2026.03.19.5');
  });

  it('ignores non-version release names when computing the next release', () => {
    expect(
      getNextVersionFromVersions(
        ['draft', 'latest', 'v2026.03.19', 'not-a-version', 'v2026.03.19.2'],
        new Date('2026-03-19T10:00:00+01:00'),
      ),
    ).toBe('v2026.03.19.3');
  });
});
