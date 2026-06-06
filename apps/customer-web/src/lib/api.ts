const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function api<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export { API_URL };
