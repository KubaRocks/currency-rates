import type { Metadata } from 'next';
import { Chakra_Petch } from 'next/font/google';
import './globals.css';

const displayFont = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Currency Rates',
  description: 'Minimal currency display for Raspberry Pi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={displayFont.variable}>{children}</body>
    </html>
  );
}
