---
name: aura-frontend-code-convention
description: >-
  AURA TECH frontend coding conventions: kebab-case files, feature modules,
  snake_case API fields, Server Components default, RHF+zod forms, Tailwind cn().
  Use when adding components, services, pages, or reviewing style consistency.
---

# Frontend Code Convention

## Naming

| Kind | Convention | Example |
|------|------------|--------|
| Files | kebab-case | `login-form.tsx`, `products-server.ts` |
| Components | PascalCase export | `ProductCard` |
| Functions | camelCase | `getProductsServer`, `addToCart` |
| API / entity fields | snake_case (match backend) | `full_name`, `stock_quantity` |
| Route groups | parentheses | `(auth)`, `(dashboard)`, `(admin)` |

## Structure

- Put domain UI and services in `features/<domain>/`, not ad-hoc under `app/`.
- Shared primitives in `components/ui/`; chrome in `components/layout/`.
- Shared types in `lib/types/`; domain extras may live in the feature.
- Pages stay thin: fetch in RSC, wrap clients in `Suspense` + skeletons/`loading.tsx`.
- Admin CRUD pages: follow [../architecture/SKILL.md](../architecture/SKILL.md) (`page` → `*-content` → `*-panel` → `*-form-modal`).

## React / TypeScript

- Default to Server Components. `'use client'` only for interactivity (forms, headers, infinite scroll).
- Strict TypeScript; prefer interfaces for entities.
- Forms: react-hook-form + `zodResolver` + UI `Label`/`Input`/`Alert`.
- Class names: `cn()` from `clsx` + `tailwind-merge`.
- Prefer server session + fetch over client global state. Zustand is for cart panel UI only (`lib/stores/cart-ui-store.ts`).

## Styling

- Tailwind utility-first.
- Reuse global component classes from `app/globals.css` (`.card-dark`, `.btn-primary`, `.input-dark`, etc.).
- Tokens live in `tailwind.config.ts` + CSS variables in `globals.css`.

## Shared `lib/` — check before adding helpers

**Before writing a local helper in a component** (e.g. `formatPrice`, `formatDate`, `getPrimaryImage`, `cn`, debounce), search `lib/` first. Extend existing modules instead of duplicating logic in feature components.

| Path | Use for |
|------|---------|
| `lib/utils/format.ts` | `formatCurrency`, `formatDate`, `formatDateTime`, `ORDER_STATUS_*`, `PAYMENT_STATUS_COLORS` |
| `lib/utils/cn.ts` | `cn()` — Tailwind class merging |
| `lib/utils/scrollCalculations.ts` | Scroll tracking, `clamp`, animation scroll state |
| `lib/products/helpers.ts` | `getAvailableStock`, `isInStock`, `getPrimaryImage`, `getProductImageUrl` |
| `lib/hooks/use-debounce.ts` | Debounced filter/search inputs |
| `lib/api/bff.ts` | `bffPath()` — backend path → `/api/...` |
| `lib/api/endpoints.ts` | Central API path constants |
| `lib/types/entities.ts` | Shared entity interfaces |
| `lib/types/api.ts` | `ApiResponse`, `CursorPage` |
| `lib/errors/api-error.ts` | `ApiError`, `getErrorMessage` |
| `lib/i18n/` | `t()`, locale, RTL |
| `lib/auth/` | Session, role constants |

### Examples — do not reimplement in panels

```ts
// ❌ Inline in a panel
function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ✅ Use existing project currency helper
import { formatCurrency } from '@/lib/utils/format';

// ❌ Inline primary image lookup
const url = product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url;

// ✅ Use product helpers
import { getProductImageUrl, getAvailableStock } from '@/lib/products/helpers';
```

If a helper is missing but broadly useful, add it under the appropriate `lib/` module (not inside a feature component), then import it.

## Do not

- Call the backend URL from browser code.
- Invent camelCase API payloads when the backend expects snake_case.
- Add Inter/system-default redesigns that fight the existing dark cyan theme (see platform design skill).
