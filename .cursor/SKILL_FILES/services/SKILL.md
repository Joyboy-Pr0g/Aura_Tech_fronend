---
name: aura-frontend-services
description: >-
  AURA TECH feature services layer: features/*/services server and client
  wrappers, endpoints map, ApiResponse handling. Use when adding or changing
  domain API calls, BFF usage, or service files.
---

# Frontend Services

## Where they live

```
features/<domain>/services/
  <domain>-server.ts   # RSC / server-only → serverFetch → backend paths
  <domain>-client.ts   # browser → clientFetch → /api/...
```

Auth is client-only: `features/auth/services/auth-service.ts` → `/api/auth/*`.

## Path rules

| Caller | Helper | Path style | Example |
|--------|--------|------------|---------|
| Server service | `serverFetch` | Backend path | `'/products'`, `endpoints.categories.root` |
| Client service | `clientFetch` | Next BFF path | `'/api/products'`, `'/api/cart'` |

Central path constants: `lib/api/endpoints.ts`.

## Existing domains

| Feature | Server | Client |
|---------|--------|--------|
| products | yes | yes |
| categories | yes | — |
| admin (categories, products, users) | `admin-*-server.ts` | `admin-*-client.ts` |
| cart / addresses / payments (cart feature) | yes | yes |
| orders | yes | yes |
| engagement | — | yes |
| auth | — | yes |

## Response contract

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: { message: string; details?: unknown };
}
```

Failures throw `ApiError` (`lib/errors/api-error.ts`). Services should not invent a different envelope.

## Adding a service

1. Add/confirm backend route + BFF `app/api/...` proxy.
2. Add endpoint constant if shared.
3. Implement `*-server.ts` and/or `*-client.ts` with the correct path style.
4. Keep pages thin — call services from RSC or client components, not raw `fetch` in pages.

## Admin services layout

```
features/admin/services/
  admin-<resource>-server.ts   # RSC initial load
  admin-<resource>-client.ts   # panel refresh + mutations (JSON or FormData)
```

See [../architecture/SKILL.md](../architecture/SKILL.md) for the full admin page stack.
