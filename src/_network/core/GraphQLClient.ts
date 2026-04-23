type GraphQLEndpointResolver = string | (() => string);
const DEFAULT_GRAPHQL_TIMEOUT_MS = 8_000;

export class GraphQLClient {
  constructor(private endpoint: GraphQLEndpointResolver) {}

  private getEndpoint() {
    if (typeof this.endpoint === "function") {
      return this.endpoint();
    }

    return this.endpoint;
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      DEFAULT_GRAPHQL_TIMEOUT_MS
    );

    try {
      const res = await fetch(this.getEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, variables }),
        signal: options?.signal ?? controller.signal,
        ...options,
      });

      if (!res.ok) {
        throw new Error(`GraphQL request failed with status ${res.status}`);
      }

      const json = (await res.json()) as {
        data?: T;
        errors?: Array<{ message?: string }>;
      };

      if (Array.isArray(json.errors) && json.errors.length > 0) {
        const firstError = json.errors[0]?.message ?? "Unknown GraphQL error";
        throw new Error(firstError);
      }

      if (json.data === undefined) {
        throw new Error("GraphQL response missing data");
      }

      return json.data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
