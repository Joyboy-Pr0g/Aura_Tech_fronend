import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { HeroSection } from '@/features/home/components/hero-section';
import { HomeShowcaseSection } from '@/features/home/components/home-showcase-section';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';

export default async function HomePage() {
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
