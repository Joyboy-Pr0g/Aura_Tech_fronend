import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { LocaleProvider } from '@/lib/i18n/locale-provider';

export const metadata: Metadata = {
  title: 'AURA TECH - Gaming Store Yemen',
  description: 'Your ultimate gaming gear destination — AURA TECH Yemen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-dark-950 text-white min-h-screen overflow-x-hidden">
        <LocaleProvider>
          {children}
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
