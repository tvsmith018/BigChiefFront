export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
}
