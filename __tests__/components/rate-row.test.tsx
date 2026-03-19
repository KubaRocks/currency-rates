import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RateRow } from '@/components/rate-row';

describe('RateRow', () => {
  it('renders the rate and spread in a fixed four-column display row', () => {
    const markup = renderToStaticMarkup(
      <RateRow
        code="USD"
        rate={{
          code: 'USD',
          nbpRate: 4,
          forexRate: 4.05,
        }}
      />,
    );

    expect(markup).toContain('USD');
    expect(markup).toContain('↑');
    expect(markup).toContain('4,0500');
    expect(markup).toContain('zł');
    expect(markup).toContain('1,25%');
    expect(markup).toContain('grid-cols-[');
  });
});
