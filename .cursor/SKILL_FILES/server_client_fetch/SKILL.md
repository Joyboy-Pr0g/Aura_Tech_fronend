---
name: aura-frontend-server-client-fetch
description: >-
  AURA TECH data fetching: serverFetch, clientFetch, fetchBackend, proxyToBackend.
  Use when loading data in RSC, calling APIs from the browser, or writing app/api
  route handlers.
---

# Server Fetch & Client Fetch

## Flow

```
Browser  --clientFetch('/api/...')-->  Next.js app/api/*  --proxy-->  BACKEND_API_URL
RSC      --serverFetch('/...')------>  fetchBackend + Bearer cookie ----------^
```

## Helpers

| Helper | File | Role |
|--------|------|------|
| `fetchBackend` | `lib/api/fetch.ts` | Absolute backend URL; optional Bearer; `cache: 'no-store'` |
| `serverFetch` | `lib/api/server.ts` | Server-only; auto `getAuthToken()` from cookies |
| `clientFetch` | `lib/api/client.ts` | Browser → same-origin `/api/...`; `credentials: 'include'` |
| `proxyToBackend` | `lib/api/route-handler.ts` | Shared Route Handler proxy; `requireAuth` default **true** |

## Usage

**Server (RSC / server service):**

```ts
await serverFetch('/products', { searchParams });
```

**Client:**

```ts
await clientFetch('/api/products', { searchParams });
```

## API routes

- Public catalog GETs: `requireAuth: false` (products, categories, public reviews/questions).
- Private resources (cart, orders, addresses, payments, wishlist mutations): default `requireAuth: true`.
- Auth login/register: set httpOnly cookie; strip token from JSON body.

## Rules

1. Never `fetch(BACKEND_API_URL)` from client components.
2. Never hardcode full backend URLs in features — use helpers + `endpoints.ts`.
3. Treat non-success `ApiResponse` as errors via `ApiError`.
4. Prefer feature services over calling helpers directly from UI.
