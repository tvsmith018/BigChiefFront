import type { RequestOptions } from "./types";

type HttpBaseUrlResolver = string | (() => string);

export class HttpClient {
  private readonly baseUrl: HttpBaseUrlResolver;

  constructor(baseUrl: HttpBaseUrlResolver) {
    this.baseUrl = baseUrl;
  }

  private getBaseUrl() {
    if (typeof this.baseUrl === "function") {
      return this.baseUrl();
    }

    return this.baseUrl;
  }

  async request<T>(
    endpoint: string,
    config: RequestOptions = {},
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = config.timeoutMs ?? 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body = config.body;
      const isFormData =
        typeof FormData !== "undefined" && body instanceof FormData;

      const extraHeaders = (config.headers ?? {}) as Record<string, string>;
      const headers = new Headers(options?.headers);

      Object.entries(extraHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      if (typeof globalThis.window === "undefined") {
        headers.set("x-bff-internal-request", "1");
      }

      let fetchBody: BodyInit | undefined;
      if (body === undefined || body === null) {
        fetchBody = undefined;
      } else if (isFormData) {
        fetchBody = body;
      } else {
        fetchBody = JSON.stringify(body);
      }

      const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        method: config.method ?? "GET",
        headers,
        body: fetchBody,
        credentials: config.credentials ?? "include",
        signal: controller.signal,
        ...options,
      });

      const parsedBody = await this.parseResponseBody(res);

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

  private async parseResponseBody(res: Response): Promise<unknown> {
    const rawBody = await res.text();
    if (!rawBody) {
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const isJsonResponse =
      contentType.includes("application/json") || contentType.includes("+json");

    if (!isJsonResponse) {
      return { detail: rawBody };
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      return { detail: "Invalid JSON response from upstream." };
    }
  }
}
