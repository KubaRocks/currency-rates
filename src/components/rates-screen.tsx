'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';
import { RateRow } from '@/components/rate-row';
import { startPolling } from '@/lib/helpers/polling';
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
    return startPolling({
      refreshRates,
      refreshVersion,
      ratesIntervalMs: POLL_INTERVAL_MS,
      versionIntervalMs: VERSION_POLL_INTERVAL_MS,
    });
  }, []);

  const ratesByCode = new Map(payload?.rates.map((rate) => [rate.code, rate]) ?? []);

  return (
    <main className="screen-shell flex items-center justify-center overflow-hidden px-[clamp(18px,3vw,34px)] py-[clamp(20px,5vh,40px)]">
      <div className="relative flex min-h-[min(78vh,460px)] w-full max-w-[940px] flex-col justify-center pl-[clamp(10px,1.2vw,16px)]">
        <div className="flex flex-col gap-[clamp(28px,8.8vh,70px)] pr-[clamp(6px,0.9vw,14px)]">
          {DISPLAY_CODES.map((code) => (
            <RateRow key={code} code={code} rate={ratesByCode.get(code)} />
          ))}
        </div>

        <footer className="absolute bottom-[clamp(8px,2.8vh,20px)] left-[clamp(10px,1.2vw,16px)] text-[clamp(0.82rem,2.4vh,1.08rem)] tracking-[0.03em] text-white/80">
          {didAttemptLoad ? getStatusLabel(payload?.stale ?? false, payload?.updatedAt ?? null) : 'LOADING'}
        </footer>
      </div>
    </main>
  );
}
