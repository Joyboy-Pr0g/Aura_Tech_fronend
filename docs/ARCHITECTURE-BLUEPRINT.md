# Aura Tech Frontend — Architecture Blueprint

Portable reference for replicating this Next.js (App Router) architecture in another project.

**Stack:** Next.js App Router · TypeScript · Feature-Driven Architecture (FDA) · BFF API layer · httpOnly cookie auth · Next.js Data Cache (tags + revalidate)

---

## 1. Design goals

| Goal | How it is achieved |
|------|-------------------|
| Thin routes | `app/` only routes, layouts, and composes feature UI |
| Isolated domains | Each business area lives in `features/<domain>/` |
| No backend URL in browser | Browser calls `/api/*`; Next.js proxies to `BACKEND_API_URL` |
| Secure auth | JWT stored in **httpOnly** cookie; never exposed to client JS |
| Fast public pages | Server Components fetch with cache profiles + tags |
| Fresh user data | Auth/user endpoints use `cacheProfile: 'none'` (no-store) |
| Predictable mutations | Client → BFF route → backend; optional cache revalidation |

**Intentionally not used:** Server Actions, React Query/SWR, global AuthProvider on the storefront.

---

## 2. Top-level folder layout

```txt
Aura_Tech/
├── app/                    # Routes, layouts, BFF API routes
├── components/             # Shared / cross-cutting UI (not domain logic)
├── features/               # Business domains (components, services, hooks, …)
├── lib/                    # Infrastructure (API, auth, utils, types)
├── public/
├── middleware.ts           # Route protection, coming-soon, role redirects
└── docs/
```

There is **no `src/` folder** — paths resolve from the project root via `@/*`.

---

## 3. `app/` — routing and BFF

### 3.1 Pages and layouts

- **Pages are thin.** They read `params` / `searchParams`, optionally call `getSession()`, then render a feature component.
- **Route groups** organize areas without affecting URLs:
  - `(auth)/` — login, register
  - `(dashboard)/` — customer area
  - `(admin)/` — admin panel
- **Dynamic SEO URLs:** `/products/[id]-[slug]`, `/blogs/[id]-[slug]`

Example page responsibility:

```tsx
// app/products/page.tsx — pattern only
export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  return <ProductsPageContent categoryId={params.category_id} />;
}
```

### 3.2 BFF API routes (`app/api/`)

~100+ route handlers mirror backend paths under `/api`.

```txt
Browser  →  /api/products          (same origin)
              ↓
         app/api/products/route.ts
              ↓
         fetchBackend('/products')  →  BACKEND_API_URL/products
```

**Two handler patterns:**

| Pattern | When | Example |
|---------|------|---------|
| `proxyToBackend()` | Most CRUD/read/write | `app/api/products/route.ts` |
| Custom handler | Cookie side-effects (login/logout) | `app/api/auth/login/route.ts` |

**Simple proxy (public GET):**

```ts
export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    path: endpoints.products.root,
    method: 'GET',
    requireAuth: false,
  });
}
```

**Proxy with cache invalidation (admin mutation):**

```ts
export async function POST(request: NextRequest) {
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.products,
    method: 'POST',
    revalidateOnSuccess: () => revalidateProductStorefront({ slug }),
  });
}
```

**Custom auth route (sets cookie):**

```ts
const response = await fetchBackend<AuthData>(endpoints.auth.login, { method: 'POST', body });
await setAuthCookie(response.data!.token);
return NextResponse.json({ success: true, data: { user: response.data!.user } });
```

**BFF rules:**

- Browser **never** calls `BACKEND_API_URL` directly.
- BFF always uses `fetchBackend()` with default `cacheProfile: 'none'` → **always `no-store`**.
- `credentials: 'include'` on client ensures cookies reach BFF routes.

---

## 4. `features/` — domain modules

Each domain is a vertical slice. Typical structure:

```txt
features/products/
├── components/       # Product-specific UI (ProductCard, filters, detail)
├── services/
│   ├── products-server.ts   # Called from Server Components / pages
│   └── products-client.ts   # Called from Client Components (via /api)
├── hooks/            # Client-only hooks (drag, pagination, forms)
├── schemas/          # Zod validation (forms)
├── types/            # Domain types (optional; shared types often in lib/types)
└── data/             # Static/mock data when needed
```

**Current domains:** `auth`, `products`, `categories`, `cart`, `orders`, `checkout`, `blogs`, `admin`, `home`, `engagement`, `notifications`, `shipping`, `coupons`, `refunds`, `expenses`, `website-settings`, `storefront`, `shared`, …

### 4.1 Dual service pattern (`*-server.ts` / `*-client.ts`)

| File | Runs on | Calls | Caching |
|------|---------|-------|---------|
| `*-server.ts` | Server (RSC, layouts) | `serverFetch()` → backend directly | Yes — cache profiles + tags |
| `*-client.ts` | Browser (Client Components) | `clientFetch('/api/...')` → BFF | No — BFF is no-store |

**Server example (cached public catalog):**

```ts
export async function getProductsServer(params) {
  const res = await serverFetch<Product[]>(
    '/products',
    { searchParams: params, cacheProfile: 'catalog', withAuth: false },
    ['products'],
  );
  return { items: res.data ?? [], next_cursor: res.next_cursor ?? null };
}
```

**Client example (same domain, browser):**

```ts
export async function getProducts(params) {
  const res = await clientFetch<Product[]>('/api/products', { searchParams: params });
  return { items: res.data ?? [], next_cursor: res.next_cursor ?? null };
}
```

**Rule:** Server Components and layouts import `*-server.ts`. Interactive client UI imports `*-client.ts`.

---

## 5. `components/` — shared UI

Use `components/` for **reusable, non-domain** UI:

```txt
components/
├── ui/              # Primitives (Button, Input, Dialog, …)
├── layout/          # Header, footer, shell wrappers
├── backgrounds/     # Page backgrounds / 3D scenes
├── storefront/      # Storefront chrome shared across pages
├── cart/            # Cart drawer / mini-cart shell
├── security/        # Turnstile, captcha wrappers
└── analytics/       # Tracking snippets
```

**vs `features/*/components/`:**

| Location | Contains |
|----------|----------|
| `components/` | Generic UI, layout shells, design-system pieces |
| `features/<domain>/components/` | Business UI tied to one domain (ProductCard, LoginForm) |

**vs `features/shared/`:** Small cross-feature helpers (motion wrappers, shared hooks) that are still “feature layer” but not tied to one domain.

---

## 6. `lib/` — infrastructure

```txt
lib/
├── api/
│   ├── fetch.ts           # fetchBackend() — low-level server → backend
│   ├── server.ts          # serverFetch() — RSC wrapper + auth defaults
│   ├── client.ts          # clientFetch() — browser → /api
│   ├── route-handler.ts   # proxyToBackend() — BFF helper
│   ├── endpoints.ts       # Single registry of backend paths
│   ├── cache.ts           # Cache profile TTLs
│   ├── bff.ts             # bffPath('/products') → '/api/products'
│   └── parse-response.ts  # Normalized ApiResponse parsing
├── auth/
│   ├── session.ts         # getSession, setAuthCookie, clearAuthCookie
│   └── constants.ts       # AUTH_COOKIE_NAME, decodeTokenRole()
├── errors/                # ApiError, getErrorMessage
├── types/                 # entities.ts, api.ts — shared DTOs
├── storefront/
│   └── revalidate.ts      # revalidateTag / revalidatePath helpers
├── security/              # Turnstile, etc.
├── i18n/                  # next-intl setup
└── utils/                 # Pure helpers
```

**No UI in `lib/`.** Only infrastructure, types, and pure functions.

---

## 7. Data flow diagrams

### 7.1 Server-rendered page (public, cached)

```txt
page.tsx (Server Component)
    ↓
features/products/services/products-server.ts
    ↓
serverFetch('/products', { cacheProfile: 'catalog', withAuth: false }, ['products'])
    ↓
fetchBackend() → BACKEND_API_URL/products
    ↓
Next.js Data Cache (revalidate: 3600s, tag: products)
    ↓
HTML streamed to browser
```

### 7.2 Client mutation / user-specific read

```txt
Client Component (e.g. add to cart)
    ↓
features/cart/services/cart-client.ts
    ↓
clientFetch('/api/cart/items', { method: 'POST', body })
    ↓
app/api/cart/items/route.ts → proxyToBackend()
    ↓
fetchBackend() with cookie token → BACKEND_API_URL
    ↓
JSON response → UI update
```

### 7.3 Session check (Server Component / layout)

```txt
getSession()
    ↓
getAuthToken() from httpOnly cookie
    ↓
fetchBackend('/auth/me', { token, cacheProfile: 'none' })
    ↓
User | null
```

---

## 8. Server fetch vs client fetch

### 8.1 Layer stack

```txt
┌─────────────────────────────────────────────────────────┐
│  Browser                                                 │
│  clientFetch() → /api/*  (credentials: 'include')       │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  BFF (app/api/*/route.ts)                                │
│  proxyToBackend() / custom handlers                      │
│  fetchBackend() — always no-store                        │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Server Components                                       │
│  serverFetch() → fetchBackend() → BACKEND_API_URL        │
│  Optional Next.js cache (profiles + tags)                │
└─────────────────────────────────────────────────────────┘
```

### 8.2 `fetchBackend()` (`lib/api/fetch.ts`)

- Base URL: `process.env.BACKEND_API_URL` (e.g. `http://localhost:4000/api`)
- Adds `Authorization: Bearer <token>` when token provided
- Adds `X-Forwarded-For` when client IP forwarded from BFF
- Resolves cache via `cacheProfile` or explicit `revalidate`

### 8.3 `serverFetch()` (`lib/api/server.ts`)

Wraps `fetchBackend` with **automatic auth attachment**:

```ts
const shouldAttachAuth = withAuth ?? !isCacheableProfile(cacheProfile);
const token = shouldAttachAuth ? explicitToken ?? (await getAuthToken()) : explicitToken;
```

| `cacheProfile` | Default `withAuth` | Meaning |
|----------------|-------------------|---------|
| `none` (default) | `true` | User-specific; attach cookie token; no cache |
| `catalog`, `product`, `categories`, … | `false` | Public read; no token unless `withAuth: true` |
| Any + `withAuth: true` | `true` | Force auth even on cacheable routes |

**Always set explicitly for public cached reads:**

```ts
serverFetch('/products', { cacheProfile: 'catalog', withAuth: false }, ['products']);
```

**Always use `none` for session/user data:**

```ts
fetchBackend(endpoints.auth.me, { token, cacheProfile: 'none' });
```

### 8.4 `clientFetch()` (`lib/api/client.ts`)

- Builds URL from `window.location.origin` + path (e.g. `/api/products`)
- `credentials: 'include'` — sends httpOnly cookie to BFF
- JSON body auto-stringified; FormData passed through
- Returns normalized `ApiResponse<T>`

---

## 9. Cookies and authentication

### 9.1 Cookie config

```ts
// lib/auth/constants.ts
export const AUTH_COOKIE_NAME = 'auth_token';

// lib/auth/session.ts
cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24, // 24 hours
};
```

### 9.2 Auth lifecycle

| Step | Where | What happens |
|------|-------|--------------|
| Login | `POST /api/auth/login` | Backend returns JWT → `setAuthCookie(token)` |
| Session read | `getSession()` | Read cookie → `GET /auth/me` (no cache) |
| Logout | `POST /api/auth/logout` | Backend logout (best effort) → `clearAuthCookie()` |
| Middleware | `middleware.ts` | Quick gate using cookie + decoded role |

### 9.3 Role decoding (middleware only)

`decodeTokenRole()` base64-decodes JWT payload client-side in middleware for **routing decisions only** (admin vs customer). Full user validation still happens via `getSession()` → `/auth/me` on the server.

Roles: `admin`, `sub_admin`, `customer`.

### 9.4 Where auth state lives

- **No global AuthProvider** on the public storefront.
- **Dashboard/admin layouts** may wrap `UserProvider` for client-side user context.
- Server layouts call `getSession()` and pass user as props or redirect.

---

## 10. Middleware (`middleware.ts`)

Matcher excludes static assets and `/api/`:

```ts
matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)']
```

**Behavior:**

1. **Coming soon** — redirect public paths when enabled.
2. **Protected routes** — `/dashboard/*`, `/admin/*` require valid cookie + role.
3. **Unauthenticated** → redirect to `/login?redirect=<path>`.
4. **Invalid/expired token** → delete cookie, redirect to login.
5. **Role redirects:**
   - `customer` on `/admin` → `/dashboard`
   - `admin` / `sub_admin` on `/dashboard` → `/admin`
6. **Already logged in** on `/login` or `/register` → middleware passes through (page may redirect via `getSession()`).

Middleware is a **coarse gate**. Pages and API routes still enforce auth via `getSession()` / `requireAuth`.

---

## 11. Caching — auth vs non-auth

### 11.1 Cache profiles (`lib/api/cache.ts`)

| Profile | TTL | Use for |
|---------|-----|---------|
| `static` | 86400s (24h) | Logo, about, website settings |
| `categories` | 86400s | Category tree |
| `catalog` | 3600s (1h) | Product lists, brands, filters, trending |
| `product` | 1800s (30m) | Single product by slug |
| `reviews` | 600s (10m) | Product reviews |
| `stock` | 300s (5m) | Inventory-sensitive data |
| `none` | 0 | User session, cart, orders, admin mutations |

Implementation:

```ts
if (seconds <= 0) return { cache: 'no-store', next: { tags } };
return { next: { revalidate: seconds, tags } };
```

### 11.2 Cache tags

Pass tags as the third argument to `serverFetch`:

```ts
serverFetch('/products', { cacheProfile: 'catalog', withAuth: false }, ['products']);
serverFetch(`/products/slug/${slug}`, { cacheProfile: 'product', withAuth: false }, ['products', `product-${slug}`]);
```

### 11.3 Auth vs public — decision matrix

| Request type | `cacheProfile` | `withAuth` | Cached? |
|--------------|----------------|------------|---------|
| Product listing (SSR) | `catalog` | `false` | Yes |
| Product detail (SSR) | `product` | `false` | Yes |
| Categories nav | `categories` | `false` | Yes |
| `getSession()` / `/auth/me` | `none` | token explicit | No |
| Cart, checkout, orders | `none` | default `true` | No |
| BFF `/api/*` routes | `none` (implicit) | via cookie | No |
| Admin writes | N/A | N/A | Triggers revalidation |

**Critical rule:** Never cache authenticated/user-specific responses with a public cache profile. The `serverFetch` default (`withAuth: true` when profile is `none`) prevents accidentally caching private data when profile is omitted.

### 11.4 Revalidation after mutations (`lib/storefront/revalidate.ts`)

Admin or storefront mutations call helpers that:

- `revalidateTag('products')`, `revalidateTag('product-{slug}')`, …
- `revalidatePath('/products')`, `revalidatePath('/sitemap.xml')`, …

Hooked from BFF via `revalidateOnSuccess` in `proxyToBackend`.

---

## 12. API endpoint registry

All backend paths live in one file:

```ts
// lib/api/endpoints.ts
export const endpoints = {
  auth: { login: '/auth/login', me: '/auth/me', … },
  products: { root: '/products', bySlug: (slug) => `/products/slug/${slug}`, … },
  admin: { products: '/admin/products', … },
};
```

**Usage:**

- BFF routes: `endpoints.products.root`
- Server services: path string or `endpoints.*`
- Client services: `/api` + backend path → `clientFetch('/api/products')`

Helper:

```ts
bffPath('/products') // → '/api/products'
```

---

## 13. Environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `BACKEND_API_URL` | `fetchBackend()` | Server-side backend base (e.g. `http://localhost:4000/api`) |
| `NODE_ENV` | Cookie `secure` flag | Production cookie security |

Client code does **not** need the backend URL.

---

## 14. Error handling

- `ApiError` — typed HTTP errors from `parseApiResponse`
- `getErrorMessage()` — safe user-facing message extraction
- BFF catches `ApiError` and returns `{ success: false, message, error }` with proper status
- Server services may catch and return fallbacks (e.g. empty array for trending)

---

## 15. Replication checklist (new project)

Use this when bootstrapping the same architecture elsewhere:

### Phase 1 — Skeleton

- [ ] Next.js App Router + TypeScript + `@/*` path alias
- [ ] Create `lib/api/{fetch,server,client,route-handler,endpoints,cache,parse-response}.ts`
- [ ] Create `lib/auth/{session,constants}.ts`
- [ ] Create `lib/errors/api-error.ts` and `lib/types/{api,entities}.ts`
- [ ] Add `middleware.ts` with cookie + role guards
- [ ] Set `BACKEND_API_URL` in `.env.local`

### Phase 2 — BFF

- [ ] For each backend resource, add `app/api/<resource>/route.ts` using `proxyToBackend`
- [ ] Implement `app/api/auth/login` and `logout` with cookie set/clear
- [ ] Set `requireAuth: false` on public GET proxies

### Phase 3 — Features

- [ ] One folder per domain under `features/`
- [ ] Pair `*-server.ts` (SSR) and `*-client.ts` (browser) per domain
- [ ] Keep pages thin — compose feature components only

### Phase 4 — Caching

- [ ] Define cache profiles in `lib/api/cache.ts`
- [ ] Tag all public `serverFetch` calls
- [ ] Add `lib/storefront/revalidate.ts` and wire `revalidateOnSuccess` on mutations

### Phase 5 — Conventions

- [ ] Document endpoint registry in `lib/api/endpoints.ts`
- [ ] Shared UI → `components/ui`, domain UI → `features/<domain>/components`
- [ ] No Server Actions; mutations go through BFF
- [ ] Public SSR = cached + `withAuth: false`; user data = `none` + auth

---

## 16. Quick reference — which tool to use

| I need to… | Use |
|------------|-----|
| Fetch data in a Server Component | `features/*/services/*-server.ts` → `serverFetch` |
| Fetch data in a Client Component | `features/*/services/*-client.ts` → `clientFetch('/api/...')` |
| Add a new backend endpoint | 1) `endpoints.ts` 2) `app/api/.../route.ts` 3) server + client services |
| Check if user is logged in (SSR) | `getSession()` from `lib/auth/session` |
| Protect a route | `middleware.ts` + page-level `getSession()` redirect |
| Cache a public API response | `cacheProfile: 'catalog'` (or other) + `withAuth: false` + tags |
| User cart / orders / profile | `cacheProfile: 'none'` (default) |
| Invalidate cache after admin edit | `revalidateOnSuccess` → `revalidate*Storefront()` |

---

## 17. Related docs

- `architecture.md` (project root) — shorter FDA overview with examples
- This file — **full blueprint** for cloning the pattern in another repo

---

*Generated from the Aura Tech frontend (`D:\Frontend\Next.js\Aura_Tech`). Update cache TTLs, domains, and roles to match your backend.*
