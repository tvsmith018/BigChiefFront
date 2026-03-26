export class GraphQLClient {
  constructor(private endpoint: string) {}

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<T> {
    const res = await fetch(this.endpoint, {
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
