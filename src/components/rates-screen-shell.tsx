'use client';

import dynamic from 'next/dynamic';

const RatesScreen = dynamic(
  () => import('@/components/rates-screen').then((mod) => mod.RatesScreen),
  {
    ssr: false,
  },
);

export function RatesScreenShell() {
  return <RatesScreen />;
}
