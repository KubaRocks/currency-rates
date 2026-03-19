import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RatesScreen } from '@/components/rates-screen';

describe('RatesScreen', () => {
  it('renders as a centered Pi-sized panel with safe margins', () => {
    const markup = renderToStaticMarkup(<RatesScreen />);

    expect(markup).toContain('items-center');
    expect(markup).toContain('justify-center');
    expect(markup).toContain('max-w-[820px]');
  });
});
