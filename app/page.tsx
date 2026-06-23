import { HeroSection } from '@/features/home/components/hero-section';
import { CategoriesSection } from '@/features/home/components/categories-section';
import { BlogsSection } from '@/features/home/components/blogs-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <BlogsSection />
    </>
  );
}
