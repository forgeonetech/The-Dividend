import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import './globals.css';
export const dynamic = 'force-dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/layout/Providers';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Financial Education & Insight`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['finance', 'investing', 'wealth', 'financial education', 'personal finance', 'long-term investing'],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${lora.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}