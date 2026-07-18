'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: 'default' | 'large';
}

export function SearchBar({
  className,
  placeholder,
  defaultValue = '',
  size = 'default',
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?search_query=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn('relative w-full', className)}>
      <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? t('home.searchPlaceholder')}
        className={cn(
          'ps-11 pe-28 bg-dark-900/80 border-white/10',
          size === 'large' && 'h-14 text-base ps-12',
        )}
      />
      <Button
        type="submit"
        size={size === 'large' ? 'md' : 'sm'}
        className={cn(
          'absolute end-1.5 top-1/2 -translate-y-1/2',
          size === 'large' && 'h-11',
        )}
      >
        {t('home.searchButton')}
      </Button>
    </form>
  );
}
