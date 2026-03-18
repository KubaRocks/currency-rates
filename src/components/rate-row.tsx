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
      <div className="flex items-baseline gap-[clamp(8px,1.2vw,18px)] leading-none">
        <span className="min-w-[3.3ch] text-[clamp(2.6rem,6.2vw,5.4rem)] font-semibold tracking-[0.05em]">
          {code}
        </span>
        <span className="text-[clamp(2.2rem,5.3vw,4.6rem)] font-semibold">{arrow}</span>
        <span className="text-[clamp(2.5rem,6.8vw,5.8rem)] font-semibold tabular-nums tracking-[0.03em]">
          {formattedRate}
        </span>
        <span className="pt-[0.18em] text-[clamp(0.95rem,1.9vw,1.45rem)] font-medium tracking-[0.05em] opacity-80">
          {spread}
        </span>
      </div>
    </section>
  );
}
