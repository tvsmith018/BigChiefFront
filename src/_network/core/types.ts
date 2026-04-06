export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  timeoutMs?: number;
}
