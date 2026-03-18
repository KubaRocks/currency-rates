import { describe, expect, it } from 'vitest';
import { calculatePercentageChange, getTrendDirection } from '@/lib/helpers/change-calculator';

describe('change calculator', () => {
  it('calculates percentage spread against the nbp rate', () => {
    expect(calculatePercentageChange(4, 5)).toBe(0.25);
  });

  it('returns up when forex is above nbp', () => {
    expect(getTrendDirection(4.2, 4.3)).toBe('up');
  });

  it('returns down when forex is below nbp', () => {
    expect(getTrendDirection(4.3, 4.2)).toBe('down');
  });

  it('returns flat when rates match', () => {
    expect(getTrendDirection(4.2, 4.2)).toBe('flat');
  });
});
