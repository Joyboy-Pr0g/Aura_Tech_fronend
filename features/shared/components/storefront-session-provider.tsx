'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@/lib/types/entities';
import { getMe } from '@/features/auth/services/auth-service';
import { getWishlist } from '@/features/engagement/services/engagement-client';

export type StorefrontSessionStatus = 'loading' | 'ready';

interface StorefrontSessionValue {
  user: User | null;
  status: StorefrontSessionStatus;
  isAuthenticated: boolean;
  isWishlisted: (productId: string) => boolean;
  setWishlisted: (productId: string, wishlisted: boolean) => void;
}

const GUEST_SESSION: StorefrontSessionValue = {
  user: null,
  status: 'ready',
  isAuthenticated: false,
  isWishlisted: () => false,
  setWishlisted: () => undefined,
};

const StorefrontSessionContext = createContext<StorefrontSessionValue>(GUEST_SESSION);

export function StorefrontSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<StorefrontSessionStatus>('loading');
  const [wishlistIds, setWishlistIds] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    let active = true;

    getMe()
      .then((me) => {
        if (!active) return;
        setUser(me ?? null);
        setStatus('ready');
        if (!me) return;
        getWishlist()
          .then((items) => {
            if (active) setWishlistIds(new Set(items.map((item) => item.id)));
          })
          .catch(() => undefined);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('ready');
      });

    return () => {
      active = false;
    };
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  const setWishlisted = useCallback((productId: string, wishlisted: boolean) => {
    setWishlistIds((current) => {
      if (current.has(productId) === wishlisted) return current;
      const next = new Set(current);
      if (wishlisted) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  }, []);

  const value = useMemo<StorefrontSessionValue>(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      isWishlisted,
      setWishlisted,
    }),
    [user, status, isWishlisted, setWishlisted],
  );

  return <StorefrontSessionContext.Provider value={value}>{children}</StorefrontSessionContext.Provider>;
}

export function useStorefrontSession(): StorefrontSessionValue {
  return useContext(StorefrontSessionContext);
}
