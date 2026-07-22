import { redirect } from 'next/navigation';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { HeroSection } from '@/features/home/components/hero-section';
import { HomeShowcaseSection } from '@/features/home/components/home-showcase-section';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';

export default async function HomePage() {
  if (isStorefrontComingSoon()) {
    redirect('/coming-soon');
  }

  const settings = await getWebsiteSettingsServer();

  return (
    <div className="relative overflow-x-clip">
      <HomePageBackground />
      <div className="relative z-10">
        <HeroSection settings={settings} />
        <HomeShowcaseSection />
      </div>
    </div>
  );
}
