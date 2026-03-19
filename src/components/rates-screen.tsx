'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';
import { RateRow } from '@/components/rate-row';
import { getStatusLabel } from '@/lib/helpers/status';
import { validateRatesResponse } from '@/lib/helpers/validators';
import type { CurrencyCode, RatesResponse, VersionResponse } from '@/types';

const DISPLAY_CODES: CurrencyCode[] = ['USD', 'EUR'];
const POLL_INTERVAL_MS = 10_000;
const VERSION_POLL_INTERVAL_MS = 60_000;

export function RatesScreen() {
  const [payload, setPayload] = useState<RatesResponse | null>(null);
  const [didAttemptLoad, setDidAttemptLoad] = useState(false);
  const currentVersionRef = useRef<string | null>(null);

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

  const refreshVersion = useEffectEvent(async () => {
    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Version request failed with ${response.status}`);
      }

      const data = (await response.json()) as VersionResponse;

      if (!data.version) {
        throw new Error('Version response did not include a version');
      }

      if (!currentVersionRef.current) {
        currentVersionRef.current = data.version;
        return;
      }

      if (currentVersionRef.current !== data.version) {
        window.location.reload();
      }
    } catch {
      // Ignore transient version lookup failures and try again on the next interval.
    }
  });

  useEffect(() => {
    void refreshRates();
    void refreshVersion();

    const ratesIntervalId = window.setInterval(() => {
      void refreshRates();
    }, POLL_INTERVAL_MS);
    const versionIntervalId = window.setInterval(() => {
      void refreshVersion();
    }, VERSION_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(ratesIntervalId);
      window.clearInterval(versionIntervalId);
    };
  }, [refreshRates, refreshVersion]);

  const ratesByCode = new Map(payload?.rates.map((rate) => [rate.code, rate]) ?? []);

  return (
    <main className="screen-shell flex items-center justify-center overflow-hidden px-[clamp(16px,2.4vw,26px)] py-[clamp(18px,4.4vh,34px)]">
      <div className="flex w-full max-w-[820px] flex-col justify-center gap-[clamp(20px,6.2vh,46px)]">
        {DISPLAY_CODES.map((code) => (
          <RateRow key={code} code={code} rate={ratesByCode.get(code)} />
        ))}

        <footer className="pt-[clamp(6px,2.1vh,16px)] pl-[clamp(4px,0.4vw,8px)] text-[clamp(0.78rem,2.5vh,1.02rem)] tracking-[0.03em] text-white/78">
          {didAttemptLoad ? getStatusLabel(payload?.stale ?? false, payload?.updatedAt ?? null) : 'LOADING'}
        </footer>
      </div>
    </main>
  );
}
