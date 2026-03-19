import { calculatePercentageChange, getTrendDirection } from '@/lib/helpers/change-calculator';
import { formatMoney, formatPercentage } from '@/lib/helpers/formatters';
import type { Rate } from '@/types';

interface RateRowProps {
  code: Rate['code'];
  rate?: Rate;
}

export function RateRow({ code, rate }: RateRowProps) {
  const direction = rate ? getTrendDirection(rate.nbpRate, rate.forexRate) : 'flat';
  const toneClass = {
    up: 'rate-tone-up',
    down: 'rate-tone-down',
    flat: rate ? 'rate-tone-flat' : 'rate-tone-dim',
  }[direction];

  const arrow = {
    up: '↑',
    down: '↓',
    flat: '→',
  }[direction];

  const formattedRate = rate ? formatMoney(rate.forexRate) : '--,---- zł';
  const spread = rate ? formatPercentage(calculatePercentageChange(rate.nbpRate, rate.forexRate)) : '--';

  return (
    <section className={`transition-colors duration-300 ${toneClass}`}>
      <div className="grid grid-cols-[max-content_max-content_auto] items-end gap-x-[clamp(10px,1.2vw,16px)] leading-[0.88]">
        <span className="min-w-[3.05ch] text-[clamp(3.55rem,13vh,6.25rem)] font-semibold tracking-[0.04em]">
          {code}
        </span>
        <span className="pb-[0.08em] text-[clamp(2.8rem,10.4vh,5rem)] font-semibold">{arrow}</span>
        <div className="flex items-end gap-x-[clamp(4px,0.75vw,10px)]">
          <span className="text-[clamp(4rem,15vh,7rem)] font-semibold tabular-nums tracking-[0.015em]">
            {formattedRate}
          </span>
          <span className="pb-[0.5em] text-[clamp(0.9rem,2.9vh,1.3rem)] font-medium tracking-[0.025em] opacity-88">
            {spread}
          </span>
        </div>
      </div>
    </section>
  );
}
