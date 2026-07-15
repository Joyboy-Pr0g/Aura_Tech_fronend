---
name: aura-frontend-architecture
description: >-
  AURA TECH frontend page architecture: thin App Router pages, RSC content,
  client panels, form modals, BFF proxies, and admin CRUD layout. Use when
  building or extending admin/resource pages (products, categories, users).
---

# Frontend Architecture

## Default page stack

Admin and dashboard resource pages follow a **thin page → server content → client panel** split. Reference implementations:

- `app/(admin)/admin/products/` + `features/admin/components/products/`
- `app/(admin)/admin/categories/` + `features/admin/components/categories/`
- `app/(admin)/admin/users/` + `features/admin/components/users/`

```
app/(admin)/admin/<resource>/
  page.tsx              # Suspense + passes searchParams to Content
  loading.tsx           # Route-level skeleton (e.g. AdminTableSkeleton)

features/admin/
  components/<resource>/
    admin-<resource>-content.tsx   # async RSC: server fetch, no 'use client'
    admin-<resource>-panel.tsx     # 'use client': table/cards, filters, actions
    <resource>-form-modal.tsx      # 'use client': create/edit modal (optional)
  services/
    admin-<resource>-server.ts     # serverFetch → backend paths
    admin-<resource>-client.ts     # clientFetch → /api/admin/... via bffPath()
  lib/
    parse-admin-<resource>-page.ts # cursor-page parser when API shape varies
  skeletons/
    admin-table-skeleton.tsx       # shared admin list skeleton

app/api/admin/<resource>/
  route.ts                         # GET list, POST create
  [id]/route.ts                    # GET one, PUT update, DELETE hard-delete
  [id]/[action]/route.ts           # POST actions (soft-delete, restore, activate, …)
```

## Layer responsibilities

| Layer | Role |
|-------|------|
| `page.tsx` | Route entry only: `Suspense`, `searchParams` typing, render `<Resource>Content`. No fetch or UI logic. |
| `*-content.tsx` | Server Component: read `searchParams`, call `*-server.ts`, pass `initial` data + filter defaults to panel. May `Promise.all` related server data (categories, brands). |
| `*-panel.tsx` | Client Component: list UI, debounced filters, URL sync via `router.push`, `refreshList()` after mutations, confirm modal, open form modal. |
| `*-form-modal.tsx` | Client Component: react-hook-form + zod, create/edit modes, submit JSON or FormData. |
| `*-server.ts` | `serverFetch(endpoints.admin.*)` for RSC initial load. |
| `*-client.ts` | `clientFetch(bffPath(endpoints.admin.*))` for browser mutations and client refresh. |
| BFF `app/api/**` | `proxyToBackend` — never expose `BACKEND_API_URL` to the browser. |

## Admin list page pattern

1. **Server initial load** — `AdminXContent` fetches first page with `searchParams` (filters, `limit`, `include_deleted`).
2. **Client filters** — panel keeps local state, debounces text inputs, syncs to URL query string (bookmarkable).
3. **Refresh after action** — `getAdmin*()` client call updates list without full page reload.
4. **Cursor pagination** — `loadMore` appends using `next_cursor` from `CursorPage<T>`.
5. **Responsive table** — desktop table (`lg:block`) + mobile cards (`lg:hidden`).
6. **Actions** — dropdown per row; destructive flows use `ConfirmModal`.
7. **i18n** — all labels via `useLocale()` / `t('admin.*')` keys in `lib/i18n/en.ts` + `ar.ts`.

## Form modal pattern (create / edit)

One modal handles both modes via a discriminated `mode` prop:

```ts
type FormMode =
  | { type: 'create' }
  | { type: 'edit'; resourceId: string };
```

**Submit body** (categories, products, and future admin resources):

```ts
const payload = { /* scalar + nested fields */ };

const body = hasFiles
  ? (() => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (jsonFields.includes(key)) formData.append(key, JSON.stringify(value));
        else formData.append(key, String(value));
      });
      files.forEach((f) => formData.append('images', f)); // or 'image' per backend
      return formData;
    })()
  : payload;

await isEdit ? updateAdmin*(id, body) : createAdmin*(body);
```

- **JSON** when no file upload (nested `features`, `variants`, `deleteImagePublicIds` stay as objects).
- **FormData** when images are present; stringify nested JSON fields the backend multipart middleware expects.
- Client services accept `FormData | Record<string, unknown>` (see `admin-categories-client.ts`, `admin-products-client.ts`).
- Surface API errors with `toast(error.message, 'error')`.

## Endpoints & types

- Add admin paths to `lib/api/endpoints.ts` under `admin.*`.
- Entity types in `lib/types/entities.ts` (e.g. `AdminProduct`, `AdminCategory`).
- Cursor helpers in `lib/types/api.ts`; page parsers in `features/admin/lib/`.

## Adding a new admin resource

1. Confirm backend routes + validators exist.
2. Add `endpoints.admin.<resource>` constants.
3. Create BFF proxies under `app/api/admin/<resource>/`.
4. Add `admin-<resource>-server.ts` + `admin-<resource>-client.ts`.
5. Add `admin-<resource>-content.tsx`, `admin-<resource>-panel.tsx`, optional form modal.
6. Wire `app/(admin)/admin/<resource>/page.tsx` + `loading.tsx`.
7. Add i18n keys (`admin.*`) in en + ar.

## Related skills

- Lib reuse (helpers) → [../code_convention/SKILL.md](../code_convention/SKILL.md)
- Fetch paths → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
- Services → [../services/SKILL.md](../services/SKILL.md)
- UI kit → [../platform_design/SKILL.md](../platform_design/SKILL.md)
