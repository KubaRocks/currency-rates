'use client';

import { startTransition, useEffect, useEffectEvent, useState } from 'react';
import { RateRow } from '@/components/rate-row';
import { getStatusLabel } from '@/lib/helpers/status';
import { validateRatesResponse } from '@/lib/helpers/validators';
import type { CurrencyCode, RatesResponse } from '@/types';

const DISPLAY_CODES: CurrencyCode[] = ['USD', 'EUR'];
const POLL_INTERVAL_MS = 10_000;

export function RatesScreen() {
  const [payload, setPayload] = useState<RatesResponse | null>(null);
  const [didAttemptLoad, setDidAttemptLoad] = useState(false);

  const refreshRates = useEffectEvent(async () => {
    try {
      const response = await fetch('/api/rates/USD,EUR', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Rates request failed with ${response.status}`);
      }

      const data: unknown = await response.json();

      if (!validateRatesResponse(data)) {
        throw new Error('Rates response did not match the expected payload');
      }

      startTransition(() => {
        setPayload(data);
        setDidAttemptLoad(true);
      });
    } catch {
      startTransition(() => {
        setDidAttemptLoad(true);
      });
    }
  });

  useEffect(() => {
    void refreshRates();
    const intervalId = window.setInterval(() => {
      void refreshRates();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshRates]);

  const ratesByCode = new Map(payload?.rates.map((rate) => [rate.code, rate]) ?? []);

  return (
    <main className="screen-shell flex items-center justify-center overflow-hidden px-[clamp(12px,2vw,28px)] py-[clamp(14px,2.6vh,30px)]">
      <div className="flex w-full max-w-[1120px] flex-col justify-center gap-[clamp(24px,6vh,56px)]">
        {DISPLAY_CODES.map((code) => (
          <RateRow key={code} code={code} rate={ratesByCode.get(code)} />
        ))}

        <footer className="pt-[clamp(8px,1.6vh,14px)] text-[clamp(0.9rem,1.4vw,1.05rem)] tracking-[0.04em] text-white/78">
          {didAttemptLoad ? getStatusLabel(payload?.stale ?? false, payload?.updatedAt ?? null) : 'LOADING'}
        </footer>
      </div>
    </main>
  );
}
