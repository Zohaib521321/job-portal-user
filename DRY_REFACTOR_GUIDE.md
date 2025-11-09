## DRY Refactor and Folder Structure Guide (User Portal)

This guide helps you remove duplication, standardize API integration, and organize the Next.js 15 App Router codebase for long-term maintainability. It’s tailored to the current stack (Next.js 15, React 19, Tailwind, TypeScript) and your backend’s response contract.

### Goals
- Replace mock data with a single, typed API layer
- Centralize error/loading states and UX patterns
- Encourage reusable UI primitives and hooks
- Keep server vs client boundaries clear and cache-aware

---

## Recommended Folder Structure (App Router Friendly)

```
src/
├── app/                         # Route segments (RSC by default)
│   ├── (marketing)/             # Optional: route groups by concern
│   ├── (app)/                   # Optional: app-secific route group
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx            # Client providers (Theme, Query, Toast)
├── components/
│   ├── ui/                      # Design system primitives (Button, Card, Input)
│   ├── common/                  # Reusable feature-agnostic blocks
│   └── features/                # Feature-specific composite components
├── lib/
│   ├── api/                     # API client, endpoints, server actions
│   │   ├── client.ts            # fetch wrapper (SSR/CSR-safe)
│   │   ├── endpoints.ts         # URL builders
│   │   ├── schemas.ts           # Zod/validators for API payloads (optional)
│   │   └── server/              # Server-only helpers (revalidate tags)
│   ├── config/                  # env, constants, feature flags
│   ├── utils/                   # pure utils (formatters, safeParse, cn)
│   └── types/                   # shared types/interfaces (API Response, models)
├── hooks/                       # Reusable client hooks (useDebounce, useToast)
├── services/                    # Feature facades (jobsService, categoriesService)
├── styles/                      # Tailwind extensions, CSS vars if needed
└── middleware.ts                # Edge middleware if used
```

Notes:
- Keep components small and composable. `features/` composes from `ui/` primitives.
- Co-locate feature-specific hooks under `hooks/` or `components/features/<feature>/hooks/` when it improves discoverability.

---

## Backend Contract (Typed Once, Reused Everywhere)

Backend success format:
```ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
  timestamp: string;
  pagination?: {
    page: number; limit: number; total: number; totalPages: number; hasMore: boolean;
  };
};

export type ApiError = {
  success: false;
  error: { message: string; statusCode: number };
  timestamp: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

Put these in `src/lib/types/api.ts` and reuse across services and components.

---

## Single API Client (SSR/CSR Safe)

`src/lib/api/client.ts`
```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // if required by backend

export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; headers?: HeadersInit; cache?: RequestCache } = {}
): Promise<T> {
  const { method = 'GET', body, headers, cache } = options;
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    next: { revalidate: 0 }, // default: no cache unless specified per call
  };

  const res = await fetch(`${BASE_URL}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const message = data?.error?.message ?? res.statusText;
    const statusCode = data?.error?.statusCode ?? res.status;
    throw new Error(`${statusCode}: ${message}`);
  }
  return data as T;
}
```

`src/lib/api/endpoints.ts`
```ts
export const endpoints = {
  health: () => `/health`,
  jobs: (q?: string) => `/jobs${q ? `?${q}` : ''}`,
  job: (id: string | number) => `/jobs/${id}`,
  categories: () => `/categories`,
  templates: () => `/templates`,
  safetyAlerts: () => `/safety-alerts`,
};
```

---

## Feature Services (Thin, Typed, Reusable)

`src/services/jobsService.ts`
```ts
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/lib/types/api';

export type Job = {
  id: number; title: string; company: string; location: string; created_at: string;
};

export async function getJobs(params?: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);

  return apiFetch<ApiResponse<Job[]>>(endpoints.jobs(q.toString()), { method: 'GET' });
}

export async function getJob(id: number | string) {
  return apiFetch<ApiResponse<Job>>(endpoints.job(id), { method: 'GET', cache: 'no-store' });
}
```

Do the same for categories, templates, and safety alerts.

---

## Server Components: Data Fetching and Caching

Prefer data fetching in Server Components (default in App Router) and pass data to Client Components for interactivity.

Example `src/app/jobs/page.tsx`:
```tsx
import { getJobs } from '@/services/jobsService';

export default async function JobsPage() {
  const res = await getJobs({ page: 1, limit: 12 });
  if (!res.success) throw new Error(res.error.message);
  const { data, pagination } = res;

  return (
    <div className="container">
      <h1 className="text-2xl font-semibold">Jobs</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <Paginator meta={pagination} />
    </div>
  );
}
```

If you need revalidation, set `next: { revalidate: <seconds> }` per call or use Next.js cache tags in a server-side helper and `revalidateTag` on mutations.

---

## Client Hooks for Search, Forms, and Local State

Reusable hooks reduce duplication:

`src/hooks/useDebounce.ts`
```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

`src/hooks/useToast.ts` can wrap your chosen toast lib for consistent messages.

---

## UI Primitives (Design System)

Keep repeated UI patterns in `components/ui/`:
- Button, Input, Select, Card, Badge, Modal, Pagination, Skeleton
- Use `cn` utility: `src/lib/utils/cn.ts`

```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
```

Centralize tokens in `globals.css` or Tailwind theme extension to prevent color/spacing drift.

---

## Error and Loading Patterns

Use route-level `loading.tsx` and `error.tsx` for consistent UX.

`src/app/jobs/loading.tsx`
```tsx
export default function Loading() {
  return <div className="p-6">Loading jobs…</div>;
}
```

`src/app/jobs/error.tsx`
```tsx
'use client';

export default function Error({ error }: { error: Error }) {
  return <div className="p-6 text-red-500">{error.message}</div>;
}
```

---

## Forms and Validation

Adopt a single form solution for the portal (react-hook-form + zod recommended). Centralize schemas in `src/lib/api/schemas.ts` or per feature to align front/back validation.

---

## Environment Configuration

Define and validate envs in one place `src/lib/config/env.ts`:
```ts
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
};

export function assertEnv() {
  if (!env.apiBaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');
  }
}
```

Call `assertEnv()` in `app/layout.tsx` (server) to fail fast in dev.

---

## Step-by-Step Migration from Mock Data

1) Foundations
   - Add `src/lib/types/api.ts`, `src/lib/api/client.ts`, `src/lib/api/endpoints.ts`.
   - Add `src/services/*Service.ts` for jobs, categories, templates, safety alerts.
   - Create `components/ui/` primitives if not present (Button, Card, Pagination, Skeleton).

2) Replace List Pages
   - For each page using mock arrays, call the service from the Server Component, handle `success` branch, and render.
   - Add `loading.tsx` and `error.tsx` to each route for consistent UX.

3) Replace Detail Pages
   - Fetch by `id` via the service. Handle 404 by throwing an error (route-level `error.tsx` will render) or rendering a not-found state.

4) Search and Filters
   - Use a Client component with `useDebounce` to build the querystring, pass to a Server Component boundary if SEO is required, or fetch client-side if interactivity dominates.

5) Pagination
   - Use backend `pagination` metadata to render a shared `Paginator` from `components/ui/`.

6) Cleanup
   - Remove mock data and duplicated fetch code.
   - Consolidate shared helpers in `lib/utils/`.

---

## Checklists

API Integration
- [ ] All fetches go through `apiFetch`
- [ ] Endpoints built via `endpoints.ts`
- [ ] Shared `ApiResponse<T>` types used end-to-end
- [ ] Errors thrown with helpful messages

UI/UX
- [ ] `loading.tsx` and `error.tsx` present for key routes
- [ ] Reusable `Skeleton` and `Paginator` components
- [ ] Forms use consistent validation approach

Code Organization
- [ ] Services are thin and typed
- [ ] Components are split into `ui/`, `common/`, `features/`
- [ ] Utils live in `lib/utils` (no re-implementations across files)

---

## FAQ

Q: Should I use a data library like React Query/SWR?
A: You can, but App Router server fetching covers most pages. For client-heavy interactions or optimistic updates, add React Query and mount its provider in `app/providers.tsx`.

Q: How to handle authenticated routes?
A: Add an auth service that attaches `Authorization: Bearer <token>` and wrap protected pages in a Server Component that validates the session (cookies) before rendering.

Q: Caching?
A: Default to `no-store` for dynamic user data. For public lists (jobs, categories), use `next: { revalidate: N }` or cache tags if freshness requirements allow.

---

With this structure, you’ll eliminate one-off fetch logic, unify types and errors, and improve component reuse across the user portal.


