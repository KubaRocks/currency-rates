import { NextResponse } from 'next/server';
import { createRatesService } from '@/lib/repositories/rates-service';
import type { CurrencyCode } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED_SYMBOLS: CurrencyCode[] = ['USD', 'EUR'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbols: string }> },
) {
  const { symbols } = await params;
  const requestedSymbols = symbols
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (!requestedSymbols.length) {
    return NextResponse.json({ message: 'No symbols provided' }, { status: 400 });
  }

  const uniqueSymbols = [...new Set(requestedSymbols)];
  const supportedSymbols = uniqueSymbols.every((symbol): symbol is CurrencyCode =>
    SUPPORTED_SYMBOLS.includes(symbol as CurrencyCode),
  );

  if (!supportedSymbols) {
    return NextResponse.json({ message: 'Unsupported symbols provided' }, { status: 400 });
  }

  const ratesService = createRatesService();
  const payload = await ratesService.getRates(uniqueSymbols);

  return NextResponse.json(payload);
}
