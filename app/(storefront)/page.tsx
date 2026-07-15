import { Suspense } from 'react';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { HeroSection } from '@/features/home/components/hero-section';
import { CategoriesSlider } from '@/features/home/components/categories-slider';
import { FeaturedProductsSection } from '@/features/home/components/featured-products-section';
import { NewsletterSection } from '@/features/home/components/newsletter-section';
import { getCategoriesServer } from '@/features/categories/services/categories-server';
import { ProductGridSkeleton } from '@/components/ui/skeleton';

async function CategoriesSection() {
  const categories = await getCategoriesServer();
  return <CategoriesSlider categories={categories} />;
}

export default function HomePage() {
  return (
    <div className="relative">
      <HomePageBackground />
      <div className="relative z-10">
        <HeroSection />
        <Suspense fallback={<div className="py-20"><ProductGridSkeleton count={4} /></div>}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<div className="py-20"><ProductGridSkeleton count={8} /></div>}>
          <FeaturedProductsSection />
        </Suspense>
        <NewsletterSection />
      </div>
    </div>
  );
}
