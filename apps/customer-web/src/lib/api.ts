/**
 * In the browser we call `/api/...` (same origin). Next.js rewrites proxy to the
 * Nest API on the VM. This fixes "Failed to fetch" when using Cloud forwarded URLs.
 * Override with NEXT_PUBLIC_API_URL for local dev without proxy if needed.
 */
function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '/api';
  }
  return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001';
}

export async function api<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const base = getApiBase().replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
