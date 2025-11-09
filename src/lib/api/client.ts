type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

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
    next: { revalidate: 0 },
  };

  const res = await fetch(`${BASE_URL}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && data.success === false)) {
    const message = data?.error?.message ?? res.statusText;
    const statusCode = data?.error?.statusCode ?? res.status;
    throw new Error(`${statusCode}: ${message}`);
  }
  return data as T;
}


