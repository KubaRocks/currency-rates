import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercentage } from '@/lib/helpers/formatters';

describe('formatters', () => {
  it('formats PLN currency with four decimal places', () => {
    expect(formatMoney(4.2713)).toBe('4,2713\xa0zł');
  });

  it('formats percentage values in pl-PL locale', () => {
    expect(formatPercentage(0.0123)).toBe('1,23%');
  });
});
