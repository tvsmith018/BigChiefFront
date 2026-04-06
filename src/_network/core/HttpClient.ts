import { RequestOptions } from "./types";

export class HttpClient {
  constructor(private baseUrl: string) {}

  async request<T>(
    endpoint: string,
    config: RequestOptions = {},
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = config.timeoutMs ?? 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: config.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        credentials: config.credentials ?? "include",
        signal: controller.signal,
        ...options,
      });

      const rawBody = await res.text();
      const parsedBody = rawBody ? JSON.parse(rawBody) : null;

      if (!res.ok) {
        if (parsedBody && typeof parsedBody === "object") {
          return parsedBody as T;
        }

        throw new Error(`Request failed with status ${res.status}`);
      }

      return parsedBody as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
