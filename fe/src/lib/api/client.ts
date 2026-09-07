export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = json?.error?.message || json?.message || `Request failed with status ${res.status}`;
      throw new ApiError(res.status, errorMsg, json);
    }

    return json as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(0, `Network or Connection Error: ${msg}`);
  }
}
