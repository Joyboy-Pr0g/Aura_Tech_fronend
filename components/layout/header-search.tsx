'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  buildProductsHref,
  getProductSearchQuery,
  PRODUCT_SEARCH_QUERY_KEY,
} from '@/lib/products/search-params';

interface HeaderSearchProps {
  className?: string;
}

function HeaderSearchInner({ className }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const isProductsPage = pathname === '/products';
  const urlQuery = isProductsPage ? getProductSearchQuery(searchParams) : '';
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isProductsPage) {
      setQuery(urlQuery);
    }
  }, [isProductsPage, urlQuery]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=5`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuggestions(data.data.map((p: { title: string }) => p.title));
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = (q: string) => {
    setOpen(false);
    const trimmed = q.trim();

    if (isProductsPage) {
      router.push(
        buildProductsHref(searchParams, {
          [PRODUCT_SEARCH_QUERY_KEY]: trimmed || null,
        }),
      );
      return;
    }

    if (trimmed) {
      router.push(`/products?${PRODUCT_SEARCH_QUERY_KEY}=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/products');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);

    if (isProductsPage) {
      router.push(
        buildProductsHref(searchParams, {
          [PRODUCT_SEARCH_QUERY_KEY]: null,
        }),
      );
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative flex-1 w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(query);
        }}
        className="relative w-full"
      >
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              navigate(query);
            }
          }}
          placeholder={t('nav.search')}
          className="ps-10 pe-10 h-10 bg-dark-900/80 border-white/10"
        />
        {query.trim() && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute end-10 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/40 hover:text-primary-400 hover:bg-white/5"
            aria-label={t('nav.clearSearch')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(query)}
          className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/40 hover:text-primary-400 hover:bg-white/5"
          aria-label={t('nav.advancedSearch')}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full mt-1 w-full rounded-lg border border-white/10 bg-dark-900 shadow-xl z-50 overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full text-start px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-primary-400"
                onClick={() => {
                  setQuery(s);
                  navigate(s);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HeaderSearch(props: HeaderSearchProps) {
  return (
    <Suspense fallback={<div className={cn('h-10 flex-1 rounded-xl bg-dark-900/50', props.className)} />}>
      <HeaderSearchInner {...props} />
    </Suspense>
  );
}
