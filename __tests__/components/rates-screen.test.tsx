import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RatesScreen } from '@/components/rates-screen';

describe('RatesScreen', () => {
  it('renders as a centered display block instead of raw top-left text', () => {
    const markup = renderToStaticMarkup(<RatesScreen />);

    expect(markup).toContain('items-center');
    expect(markup).toContain('justify-center');
    expect(markup).toContain('max-w-[');
  });
});
