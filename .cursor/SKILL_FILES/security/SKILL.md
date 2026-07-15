---
name: aura-frontend-security
description: >-
  AURA TECH frontend security: httpOnly auth_token, BFF-only BACKEND_API_URL,
  middleware and layout role gates, proxy requireAuth. Use when touching auth,
  cookies, API routes, env vars, or access control.
---

# Frontend Security

## Auth session

- Cookie: `auth_token` (`lib/auth/constants.ts`).
- Set only on server via `setAuthCookie` after login/register (`lib/auth/session.ts`).
- Flags: **httpOnly**, `secure` in production, `sameSite: 'lax'`, `path: '/'`, `maxAge: 24h`.
- Login/register JSON returns `{ user }` only — **never** return the JWT to the client.

## BFF boundary

- `BACKEND_API_URL` is server-only (see `.env.example`). Never expose as `NEXT_PUBLIC_*`.
- Browser uses same-origin `/api/*` with `credentials: 'include'`.
- Middleware **does not** run on `api/` — each route must enforce auth via `proxyToBackend` / `getAuthToken`.

## Protection layers

1. **Middleware** — gates `/dashboard` and `/admin`; role redirects (see middleware skill).
2. **Layouts** — `(dashboard)` requires `customer`; `(admin)` rejects `customer`.
3. **API proxies** — `requireAuth: true` by default; public GETs set `requireAuth: false` explicitly.

## JWT in middleware

`decodeTokenRole` only base64-decodes payload for `exp` + role gatekeeping. Cryptographic verification happens on the backend Bearer check.

## Operational rules

- Logout clears cookie even if backend logout fails.
- `/api/auth/me` clears cookie on 401/403.
- Keep `.env` / `.env*.local` out of git; document vars in `.env.example` only.
- Do not log tokens or put secrets in client bundles.
