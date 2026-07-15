---
name: aura-frontend-middleware
description: >-
  AURA TECH Next.js middleware: dashboard/admin protection, role redirects,
  auth cookie clear. Use when changing route protection or redirects.
---

# Frontend Middleware

File: `middleware.ts`.

## Matcher

Runs on pages; **excludes** `_next/static`, `_next/image`, `favicon.ico`, and **`api/`**.

API auth is per-route (`proxyToBackend`), not middleware.

## Responsibilities

1. Protect `/dashboard` and `/admin`:
   - No `auth_token` → `/login?redirect=...`
   - Invalid/expired role from JWT payload → clear cookie → login
   - `customer` on `/admin` → `/dashboard`
   - `admin` / `sub_admin` on `/dashboard` → `/admin`
2. On login/register with a bad token: clear cookie and continue.

Storefront Header/Footer come from `app/(storefront)/layout.tsx`, not middleware.

## Role decode

`decodeTokenRole` (`lib/auth/constants.ts`): base64 JWT payload, check `exp`, role ∈ `admin | sub_admin | customer`. Not signature verification.

## Layout double-check

Middleware is not enough alone:

- `(dashboard)/layout.tsx` — `getSession()`; must be `customer`
- `(admin)/layout.tsx` — `getSession()`; must not be `customer`
- Inject user via `UserProvider`

## When changing middleware

- Keep `api/` excluded unless you intentionally move API gating into middleware.
- Align role redirects with backend roles (`admin`, `sub_admin`, `customer`).
