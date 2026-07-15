---
name: aura-frontend-overview
description: >-
  AURA TECH frontend overview: Next.js 14 App Router gaming store, stack,
  folder structure, and key routes. Use when onboarding, locating modules,
  or deciding where a new page/feature belongs.
---

# Frontend Overview

## Purpose

AURA TECH — Gaming Store Yemen. Public catalog/cart/checkout, customer dashboard, and admin ops UI. Talks to the Node API only through a Next.js BFF (`BACKEND_API_URL`).

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14.2 (App Router) |
| UI | React 18, Tailwind 3.4, Radix primitives |
| Language | TypeScript strict (`@/*` → root) |
| Forms | react-hook-form + zod |
| Motion / 3D | framer-motion, three (home background) |
| State | zustand (cart panel UI only) |
| Dev port | **3001** |

## Layout

```
app/                 # Pages + API BFF route handlers
components/          # ui/, layout/, backgrounds/, cart/, orders/
features/            # Domain modules (preferred for business UI)
lib/                 # api/, auth/, types/, errors/, i18n/, stores/, utils/
middleware.ts
```

### Feature module shape

```
features/<domain>/
  components/
  services/          # *-server.ts / *-client.ts
  skeletons/
  schemas/           # zod when needed
```

## Route groups

| Area | Paths |
|------|-------|
| Storefront | `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/about`, `/contact`, `/blogs` |
| Auth | `/login`, `/register` — group `(auth)` |
| Customer | `/dashboard/**` — group `(dashboard)` |
| Admin | `/admin/**` — group `(admin)` |
| BFF | `app/api/**` → backend |

## Related skills

- Conventions → [../code_convention/SKILL.md](../code_convention/SKILL.md)
- Architecture (admin pages) → [../architecture/SKILL.md](../architecture/SKILL.md)
- Fetch → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
- Design → [../platform_design/SKILL.md](../platform_design/SKILL.md)
