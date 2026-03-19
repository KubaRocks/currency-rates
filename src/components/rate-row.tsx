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
      <div className="grid grid-cols-[max-content_max-content_1fr_max-content] items-end gap-x-[clamp(10px,1.4vw,18px)] leading-none">
        <span className="min-w-[3.1ch] text-[clamp(3rem,11.4vh,5.6rem)] font-semibold tracking-[0.04em]">
          {code}
        </span>
        <span className="pb-[0.12em] text-[clamp(2.45rem,9.2vh,4.6rem)] font-semibold">{arrow}</span>
        <span className="text-[clamp(3.15rem,12.2vh,6rem)] font-semibold tabular-nums tracking-[0.02em]">
          {formattedRate}
        </span>
        <span className="self-end pb-[0.72em] text-[clamp(0.78rem,2.8vh,1.2rem)] font-medium tracking-[0.03em] opacity-85">
          {spread}
        </span>
      </div>
    </section>
  );
}
