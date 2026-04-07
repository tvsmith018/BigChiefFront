type GraphQLEndpointResolver = string | (() => string);

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
    const res = await fetch(this.getEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ query, variables }),
      ...options
    });

    const json = await res.json();
    return json.data;
  }
}
