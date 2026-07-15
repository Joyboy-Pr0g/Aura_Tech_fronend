---
name: aura-frontend-platform-design
description: >-
  AURA TECH UI platform: dark cyan gaming brand, storefront vs portal shells,
  UI kit, Tailwind tokens, en/ar i18n RTL, Three.js home atmosphere. Use when
  building pages, layouts, components, or visual work.
---

# Frontend Platform Design

## Brand

- Dark gaming UI: `bg-dark-950` (`#050507`), `<html className="dark">`.
- Primary cyan `#00D9FF`, secondary blue `#0066FF`.
- Logo treatment: **AURA** (primary) + **TECH** (white).
- Atmosphere: glow accents, glass (`bg-dark-900/60 backdrop-blur-xl`), borders `border-white/10`.
- Images: Cloudinary only (`next.config.mjs` remotePatterns).

Preserve this language. Do not switch to light purple-on-white or generic cream/serif marketing templates.

## Shells

| Surface | Chrome |
|---------|--------|
| Storefront | `app/(storefront)/layout.tsx` → Header + main + Footer |
| App (`/dashboard`, `/admin`, `/login`, `/register`) | Own route-group layouts; no marketing header/footer |

Do **not** put Header/Footer in the root layout or gate them with pathname headers — use the `(storefront)` route group only.

## UI kit

Prefer `components/ui/*`: Button/ButtonLink, Card*, Input, Label, Badge, Container, Skeleton, Alert, Separator, Breadcrumb, Dropdown, ProductImage, RatingStars, Toaster.

Domain components live under `features/*/components/`.

## Motion / media

- Home: Three.js `GamingCircuitBoard` via `dynamic(..., { ssr: false })`.
- Auth layouts: radial gradients + grid overlay.
- Icons: lucide-react. Motion: framer-motion when intentional hierarchy is needed (not noise).

## i18n & locale UX

- `lib/i18n/locale-provider.tsx`: `en` | `ar`, `dir` ltr/rtl, `t(key)`, `localStorage` key `aura-locale`.
- Currency: **`formatCurrency`** from `lib/utils/format.ts` (Yemeni ريال) — do not add ad-hoc `Intl.NumberFormat` in components.
- Dates: **`formatDate`**, **`formatDateTime`** from `lib/utils/format.ts`.
- Product display: **`getProductImageUrl`**, **`getAvailableStock`** from `lib/products/helpers.ts`.
- Use RTL-aware utilities (`ms-auto`, `rtl:rotate-180`) where direction matters.
- Register validates Yemeni phones (`+967` / `07…`).

## Section discipline

- One job per section; avoid card-heavy dashboards on marketing surfaces unless interaction needs a card.
- First viewport on promotional pages: brand, one headline, short support, CTA, dominant visual — not stat strips or promo chips.
