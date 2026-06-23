'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: 'default' | 'large';
}

export function SearchBar({
  className,
  placeholder = 'Search products, brands, categories...',
  defaultValue = '',
  size = 'default',
}: SearchBarProps) {
  const router = useRouter();
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
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'pl-11 pr-28 bg-dark-900/80 border-white/10',
          size === 'large' && 'h-14 text-base pl-12',
        )}
      />
      <Button
        type="submit"
        size={size === 'large' ? 'md' : 'sm'}
        className={cn(
          'absolute right-1.5 top-1/2 -translate-y-1/2',
          size === 'large' && 'h-11',
        )}
      >
        Search
      </Button>
    </form>
  );
}
