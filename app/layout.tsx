import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { SiteWrapper } from '@/components/layout/site-wrapper';
import { BackgroundShell } from '@/components/backgrounds/background-shell';

export const metadata: Metadata = {
  title: 'AURA TECH - Yemen',
  description: 'Premium tech products from AURA TECH Yemen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-dark-950 text-white min-h-screen overflow-x-hidden">
        {/* <BackgroundShell
          variant="particles"
          color1="#00D9FF"
          color2="#0066FF"
          color3="#C0C0C0"
          scrollSensitivity={1}
          particleCount={500}
          intensity={1}
        /> */}

        <div className="relative z-10">
          <SiteWrapper>{children}</SiteWrapper>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
