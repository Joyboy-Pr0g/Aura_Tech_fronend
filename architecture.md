# Feature-Driven Architecture in Next.js (App Router)

This document explains a scalable Feature-Driven Architecture (FDA) for Next.js applications using the App Router.

---

# Goal

The main idea is:

- Pages inside `app/` are responsible for routing and page composition.
- Business logic belongs to features.
- Shared infrastructure belongs to `lib/`.
- API communication is centralized.
- Features are isolated and can evolve independently.

---

# Project Structure

```txt
src/
│
├── app/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   └── ...
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (admin)/
│   │   ├── users/
│   │   ├── roles/
│   │   └── page.tsx
│   │
│   ├── blogs/
│   │   ├── page.tsx
│   │   └── [id]-[slug]/
│   │       └── page.tsx
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]-[slug]/
│   │       └── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   ├── contact/
│   │   └── page.tsx
│   │
│   ├── forbidden/
│   │   └── page.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── features/
│   │
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── schemas/
│   │   └── constants/
│   │
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── schemas/
│   │
│   ├── blogs/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── admin/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── shared/
│       ├── components/
│       ├── hooks/
│       └── types/
│
├── lib/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── fetch.ts
│   │   └── endpoints.ts
│   │
│   ├── auth/
│   │   └── session.ts
│   │
│   ├── utils/
│   │
│   └── errors/
│
└── middleware.ts
```

---

# Responsibility of app/

The `app/` directory should remain thin.

Its responsibility is:

- Define routes.
- Read route params.
- Read search params.
- Perform authentication checks.
- Compose feature components.

The page should not contain business logic.

Example:

```tsx
// app/(auth)/login/page.tsx

import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { PageTransition } from "@/shared/components/motion";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const user = await getSession();

  if (user) {
    redirect({ href: "/dashboard" });
  }

  return (
    <PageTransition className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </PageTransition>
  );
}
```

This page only:

1. Checks authentication.
2. Redirects if authenticated.
3. Renders the feature component.

All login logic belongs to the Auth Feature.

---

# Authentication Flow

Authentication infrastructure belongs to:

```txt
lib/auth/
```

Example:

```ts
export const AUTH_COOKIE_NAME = "auth_token";

export async function getAuthToken() {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}
```

---

```ts
export async function getSession(): Promise<User | null> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetchWithCache<MeResponse>(
      "/auth/me",
      {
        token,
        cache: "no-store",
      }
    );

    return response.data;
  } catch {
    return null;
  }
}
```

The page does not know how sessions work.

It simply calls:

```ts
await getSession();
```

---

# API Route Layer

The browser should not directly call the backend.

Instead:

```txt
Browser
   ↓
Next.js API Route
   ↓
Backend API
```

Example:

```ts
await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
  }),
});
```

The browser talks only to:

```txt
localhost:3000/api/auth/login
```

Then:

```txt
app/api/auth/login/route.ts
```

forwards the request to:

```txt
https://api.example.com/auth/login
```

Benefits:

- Hide backend URLs.
- Centralize authentication handling.
- Manage cookies securely.
- Add logging.
- Add rate limiting.
- Add request transformation.

---

# Login Flow

## 1. User submits form

```tsx
<LoginForm />
```

Inside:

```tsx
const res = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
  }),
});
```

---

## 2. Next.js API Route

```txt
app/api/auth/login/route.ts
```

Receives request.

---

## 3. Route calls backend

```txt
Backend API
POST /auth/login
```

---

## 4. Backend returns token

```json
{
  "token": "jwt-token"
}
```

---

## 5. Next.js stores cookie

```ts
cookies().set(
  "auth_token",
  token,
  {
    httpOnly: true,
    secure: true,
  }
);
```

---

## 6. User navigates

```ts
router.push("/chat");
```

---

## 7. Server Components read cookie

```ts
const user = await getSession();
```

---

# Feature Modules

Each business domain owns its own code.

Example:

```txt
features/
├── auth/
├── products/
├── blogs/
├── admin/
```

Every feature contains everything it needs.

Example:

```txt
features/auth/
│
├── components/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── forgot-password-form.tsx
│
├── services/
│   └── auth-service.ts
│
├── hooks/
│   └── use-login.ts
│
├── schemas/
│   └── login-schema.ts
│
├── types/
│   └── auth.ts
│
└── constants/
```

---

# Product Feature

```txt
features/products/
│
├── components/
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   └── product-filter.tsx
│
├── services/
│   └── product-service.ts
│
├── hooks/
│   └── use-products.ts
│
├── types/
│   └── product.ts
│
└── schemas/
```

---

# Product Listing Route

```txt
/products
```

Accepts query parameters:

```txt
/products?category_id=5
/products?search_query=laptop
/products?category_id=5&search_query=laptop
```

Example:

```tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category_id?: string;
    search_query?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <ProductsPageContent
      categoryId={params.category_id}
      searchQuery={params.search_query}
    />
  );
}
```

---

# Product Details Route

```txt
/products/[id]-[slug]
```

Examples:

```txt
/products/15-macbook-pro
/products/22-gaming-laptop
/products/55-office-chair
```

Folder:

```txt
app/products/[id]-[slug]/page.tsx
```

Example:

```tsx
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const id = Number(slug.split("-")[0]);

  return <ProductDetails id={id} />;
}
```

---

# Blog Routes

Listing:

```txt
/blogs
```

Details:

```txt
/blogs/[id]-[slug]
```

Examples:

```txt
/blogs/12-nextjs-guide
/blogs/20-feature-driven-architecture
```

---

# Shared Components

Reusable UI belongs to:

```txt
features/shared/
```

Examples:

```txt
features/shared/components/
├── button.tsx
├── modal.tsx
├── table.tsx
├── loader.tsx
└── pagination.tsx
```

These components are not tied to a specific feature.

---

# lib/api

The API layer centralizes communication.

Structure:

```txt
lib/api/
├── client.ts
├── server.ts
├── fetch.ts
└── endpoints.ts
```

Examples:

```ts
fetchApi("/products");
fetchApi("/blogs");
fetchApi("/auth/me");
```

Benefits:

- Single fetch implementation.
- Consistent error handling.
- Consistent headers.
- Consistent authentication.

---

# lib/errors

Centralized error handling.

```txt
lib/errors/
├── api-error.ts
├── validation-error.ts
└── auth-error.ts
```

Example:

```ts
throw new ApiError("Product not found");
```

---

# lib/utils

Shared helpers.

```txt
lib/utils/
├── date.ts
├── currency.ts
├── string.ts
├── number.ts
└── url.ts
```

---

# Architecture Rules

## app/

Contains:

- Routes
- Layouts
- Loading states
- Error pages
- Route protection

Must NOT contain:

- API logic
- Validation logic
- Business logic

---

## features/

Contains:

- Components
- Hooks
- Services
- Types
- Schemas
- Business logic

Every feature owns its functionality.

---

## lib/

Contains:

- Infrastructure
- API clients
- Session management
- Utilities
- Error handling

No UI should exist here.

---

# Data Flow

```txt
Browser
   ↓
Feature Component
   ↓
/api/*
   ↓
Next.js Route Handler
   ↓
Backend API
   ↓
Response
   ↓
Feature Component
```

Server-side flow:

```txt
Page.tsx
   ↓
getSession()
   ↓
lib/auth/session.ts
   ↓
Backend API
   ↓
User Data
   ↓
Page Render
```

This architecture keeps pages simple, business logic isolated, API access centralized, and features independently maintainable as the application grows.