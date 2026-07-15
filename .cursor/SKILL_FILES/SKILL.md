---
name: aura-tech-frontend
description: >-
  Index of AURA TECH Next.js frontend project skills. Use when working on the
  Aura Tech storefront, dashboard, admin UI, BFF API routes, fetch helpers,
  middleware, services, security, or design system. Read the matching topic
  skill before changing code.
---

# AURA TECH Frontend — Skill Index

Yemen gaming e-commerce storefront built with **Next.js 14 App Router**, TypeScript, Tailwind, and a BFF that proxies to the Node backend. Dev server: port **3001**.

Before implementing or reviewing frontend work, open the topic skill that matches the task:

| Skill | Path | Use when |
|-------|------|----------|
| Overview | [overview/SKILL.md](overview/SKILL.md) | Onboarding, stack, folders, routes |
| Architecture | [architecture/SKILL.md](architecture/SKILL.md) | Admin/resource page stack, content/panel/modal, BFF layout |
| Code convention | [code_convention/SKILL.md](code_convention/SKILL.md) | Naming, features layout, forms, TS style, **lib reuse** |
| Security | [security/SKILL.md](security/SKILL.md) | Auth cookies, BFF secrets, route protection |
| Services | [services/SKILL.md](services/SKILL.md) | Feature services, endpoints map |
| Server / client fetch | [server_client_fetch/SKILL.md](server_client_fetch/SKILL.md) | `serverFetch`, `clientFetch`, proxies |
| Middleware | [middleware/SKILL.md](middleware/SKILL.md) | Route gates, roles, `x-pathname` |
| Platform design | [platform_design/SKILL.md](platform_design/SKILL.md) | Brand, shells, UI kit, i18n |

## Quick rules

1. Browser never calls `BACKEND_API_URL` — only `/api/*` via `clientFetch` or RSC via `serverFetch`.
2. Domain logic lives under `features/<domain>/`; thin pages in `app/`.
3. Prefer Server Components; add `'use client'` only when needed.
4. Match existing snake_case API fields and kebab-case file names.
5. Preserve dark cyan gaming brand and storefront vs portal shells.
6. no comments left after editing
7. **Check `lib/` for existing helpers before adding inline utilities** (see code convention skill).
8. **Admin/resource pages** follow the architecture skill (`page` → `content` → `panel` → `form-modal`).

Backend skills live in the sibling repo: `Aura_Tech_backend/.cursor/SKILL_FILES/`.
