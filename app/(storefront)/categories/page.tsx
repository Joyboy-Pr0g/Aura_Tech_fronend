import { getCategoriesServer } from '@/features/categories/services/categories-server';
import { CategoriesPageShell } from '@/features/categories/components/categories-catalog';

export default async function CategoriesPage() {
  const categories = await getCategoriesServer();

  return (
    <div className="py-10 lg:py-14">
      <CategoriesPageShell categories={categories} />
    </div>
  );
}
