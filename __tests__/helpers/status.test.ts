import { describe, expect, it } from 'vitest';
import { formatStatusTime, getStatusLabel } from '@/lib/helpers/status';

describe('status helpers', () => {
  it('formats the updated timestamp for the display footer', () => {
    expect(formatStatusTime('2026-03-18T12:05:00+01:00')).toBe('12:05');
  });

  it('returns a stale label with timestamp when data is old', () => {
    expect(getStatusLabel(true, '2026-03-18T12:05:00+01:00')).toBe('STALE 12:05');
  });

  it('returns a live label with timestamp when data is fresh', () => {
    expect(getStatusLabel(false, '2026-03-18T12:05:00+01:00')).toBe('LIVE 12:05');
  });

  it('returns loading when no timestamp is available yet', () => {
    expect(getStatusLabel(false, null)).toBe('LOADING');
  });
});
