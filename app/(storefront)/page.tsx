import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { HeroSection } from '@/features/home/components/hero-section';
import { CategoriesSlider } from '@/features/home/components/categories-slider';
import { FeaturedProductsSection } from '@/features/home/components/featured-products-section';
import { NewsletterSection } from '@/features/home/components/newsletter-section';
import { getCategoriesServer } from '@/features/categories/services/categories-server';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';
import { ProductGridSkeleton } from '@/components/ui/skeleton';

async function CategoriesSection() {
  const categories = await getCategoriesServer();
  return <CategoriesSlider categories={categories} />;
}

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
        <Suspense fallback={<div className="py-20"><ProductGridSkeleton count={4} /></div>}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<div className="py-20"><ProductGridSkeleton count={8} /></div>}>
          <FeaturedProductsSection />
        </Suspense>
        {/* <NewsletterSection /> */}
      </div>
    </div>
  );
}
