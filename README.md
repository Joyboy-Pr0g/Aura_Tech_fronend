# AURA TECH — Frontend

Arabic-first **Next.js 14** storefront and admin back office for the AURA TECH gaming & tech e-commerce platform. Server-rendered catalog pages, secure BFF API layer, multi-step checkout, payment receipt flow, and a full admin console.

**Production:** [www.auratechplus.com](https://www.auratechplus.com)  
**Backend companion:** [Aura_Tech_backend](../../Backend/Node.js/Aura_Tech_backend) (Express API, port 3000)

---

## Highlights (for reviewers)

| Area | What was built |
|------|----------------|
| **Architecture** | Next.js 14 App Router with route groups + **BFF** (~104 `/api/*` proxy routes) |
| **Auth** | httpOnly JWT cookie; middleware role guards; Turnstile on sensitive auth actions |
| **Data fetching** | Hybrid SSR (`serverFetch`) + client mutations (`clientFetch` → BFF → backend) |
| **i18n** | Arabic default, English toggle, RTL layout, 1100+ translation keys |
| **Storefront** | Product grid with filters, variant detail, cart drawer, 4-step checkout, SAR/YER currency toggle |
| **Admin** | 17+ admin sections with nav badges, cursor-paginated tables, analytics dashboards |
| **UX** | Gaming-themed dark UI, 3D category carousel (Three.js), framer-motion reveals |
| **Integrations** | Firebase push, Cloudflare Turnstile, Vercel Analytics |
| **Security** | Backend URL never exposed to browser; tokens only in httpOnly cookies |

---

## Tech stack

- **Framework:** Next.js 14.2 (App Router)
- **UI:** React 18, Tailwind CSS 3.4, Radix UI, lucide-react
- **Forms:** react-hook-form + zod
- **State:** zustand (cart UI), React context (locale, currency, user)
- **Animation:** framer-motion, three.js
- **Auth:** httpOnly cookies + middleware; Cloudflare Turnstile
- **Push:** Firebase (FCM)
- **Language:** TypeScript strict

**Dev ports:** Frontend **3001** · Backend **3000**

---

## Features

### Storefront

- Homepage with hero, **3D category carousel**, trending products carousel
- Product listing — infinite scroll, category/brand/price filters, search, sort
- Product detail — variants, reviews, Q&A, wishlist, back-in-stock reminders
- Cart drawer + full cart page
- **4-step checkout** — address → shipping → payment → review
- Bank transfer (receipt upload + payer account) or pay-on-delivery
- Auto-verify payment info modal (explains SMS matching status)
- Blogs, about, contact, legal pages (privacy, terms)
- Coming-soon mode (env + middleware gate)
- SEO — dynamic metadata, sitemap, JSON-LD, category URL rewrites

### Customer dashboard (`/dashboard`)

- Profile with email verification (OTP + Turnstile)
- Addresses, order history & detail, wishlist, reviews, notifications

### Admin (`/admin`)

- Dashboard KPIs
- Users (+ detail: orders, reviews, questions)
- **Suspicious users** — fraud reports, dismiss/block/delete
- Categories, products (variants, stock, images)
- Orders, payments (incl. auto-verify status), payment bridge devices
- Refunds, expenses, coupons, shipping fees, blogs
- Q&A moderation, analytics, website settings, notifications

---

## Architecture

```text
Browser
  ├── Server Components ── serverFetch ──────────► Backend API (:3000)
  └── Client Components ── clientFetch ──► BFF (/api/*) ──► Backend API
                                              ↑
                                    httpOnly auth_token cookie
```

### Why BFF?

- Backend URL stays server-only (`BACKEND_API_URL` never in browser bundle)
- JWT attached from httpOnly cookie on the server
- Turnstile verification before auth calls
- Consistent error handling via `parseApiResponse`

### Key `lib/` modules

| Path | Role |
|------|------|
| `lib/api/fetch.ts` | Low-level `fetchBackend` to Express API |
| `lib/api/server.ts` | `serverFetch` — RSC reads with auto auth |
| `lib/api/client.ts` | `clientFetch` — browser → same-origin BFF |
| `lib/api/route-handler.ts` | `proxyToBackend` for Route Handlers |
| `lib/api/endpoints.ts` | Centralized backend path constants |
| `lib/api/cache.ts` | Revalidation profiles (catalog, product, stock, …) |
| `lib/auth/session.ts` | Cookie read/write, `getSession()` |
| `lib/i18n/` | Locale provider, en/ar dictionaries |

---

## Project structure

```
app/
├── (storefront)/          # Public shop — home, products, cart, checkout, blogs
├── (dashboard)/           # Customer account area
├── (admin)/               # Admin back office
├── (auth)/                # Login, register, forgot password
├── api/                   # BFF route handlers (~104 routes)
├── layout.tsx             # Root layout, providers, SEO
└── middleware.ts          # Auth, role redirects, coming-soon

features/                  # Feature-sliced modules
├── admin/                 # Admin panels, services, hooks
├── auth/                  # Forms, schemas, auth service
├── cart/, checkout/, orders/, products/, categories/
├── home/                  # Hero, 3D carousels
└── …                      # blogs, coupons, refunds, legal, etc.

components/
├── ui/                    # Design system (button, modal, badge, …)
└── layout/                # Header, footer, navbar

lib/                       # API layer, auth, i18n, types, utils
```

**Pattern per feature:**

```
features/{domain}/
├── components/            # UI
├── services/
│   ├── *-server.ts        # RSC → serverFetch
│   └── *-client.ts        # Browser → clientFetch → BFF
└── schemas/               # zod validation (where used)
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Backend API running on port **3000** (see backend README)
- (Optional) Firebase, Turnstile keys for full auth/push

### Local development

```bash
cd Aura_Tech
cp .env.example .env.local
```

Minimal `.env.local` for local dev:

```env
BACKEND_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
STOREFRONT_COMING_SOON=false
NEXT_PUBLIC_STOREFRONT_COMING_SOON=false
```

```bash
npm install
npm run dev    # http://localhost:3001
```

Start the **backend first** on port 3000. If port 3000 is occupied (e.g. by Docker), SSR fetches will fail with `fetch failed` / `ECONNRESET`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

---

## Environment variables

See `.env.example`. Never commit real secrets.

| Variable | Purpose |
|----------|---------|
| `BACKEND_API_URL` | Server-only backend base URL (BFF + RSC) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for SEO and links |
| `STOREFRONT_COMING_SOON` | Gate storefront behind `/coming-soon` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (push notifications) |
| `NEXT_PUBLIC_TURNSTILE_*` | Cloudflare Turnstile site + secret keys |

---

## Route map (summary)

| Group | Paths |
|-------|-------|
| Storefront | `/`, `/products`, `/products/[slug]`, `/categories`, `/cart`, `/checkout`, `/blogs` |
| Auth | `/login`, `/register`, `/forget-password` |
| Dashboard | `/dashboard`, `/dashboard/orders`, `/dashboard/profile`, … |
| Admin | `/admin`, `/admin/users`, `/admin/products`, `/admin/payments`, `/admin/suspicious-users`, … |

Middleware protects `/dashboard` and `/admin`, redirects by JWT role, and optionally gates storefront with coming-soon.

---

## Design decisions (interview talking points)

1. **BFF over direct backend calls** — Hides API URL, centralizes auth cookie handling, enables Turnstile checks server-side.
2. **serverFetch vs clientFetch** — SSR for SEO and first paint; client fetch only where interactivity needs it (admin tables, checkout, cart).
3. **Feature folders** — Colocate UI + server/client services per domain; scales better than a flat `components/` tree.
4. **httpOnly cookies** — JWT never in localStorage; XSS-resistant session model.
5. **Cache profiles** — Different revalidation TTLs for catalog vs stock-sensitive data.
6. **Arabic-first i18n** — Default locale `ar`, RTL via `dir` attribute, Cairo font; not bolted on as an afterthought.
7. **Route groups** — `(storefront)`, `(admin)`, `(dashboard)` share layouts without polluting URLs.

---

## Screenshots & demo

_Add screenshots or a Loom link here for portfolio/interviews._

Suggested captures: homepage carousel, product detail, checkout, admin payments, suspicious users panel.

---

## Related documentation

- Backend README: [`../../Backend/Node.js/Aura_Tech_backend/README.md`](../../Backend/Node.js/Aura_Tech_backend/README.md)
- Full system brief: [`../../Backend/Node.js/Aura_Tech_backend/AURA_TECH_SYSTEM_OVERVIEW_FOR_CLAUDE.md`](../../Backend/Node.js/Aura_Tech_backend/AURA_TECH_SYSTEM_OVERVIEW_FOR_CLAUDE.md)

---

## License

Private — AURA TECH. All rights reserved.
