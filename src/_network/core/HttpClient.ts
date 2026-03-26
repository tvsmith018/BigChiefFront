import { ApiResponse, RequestOptions } from "./types";

export class HttpClient {
  constructor(private baseUrl: string) {}

  async request<T>(
    endpoint: string,
    config: RequestOptions = {},
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: config.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
      credentials: "include", // 🔐 JWT cookies
      ...options
    });

    return res.json();
  }
}