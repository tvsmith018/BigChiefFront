import { HttpClient } from "./core/HttpClient";
import { GraphQLClient } from "./core/GraphQLClient";

import {
  API_BASE_URL,
  resolveGraphQLEndpoint,
  resolveHttpBaseUrl,
} from "./config/endpoints";
export { AUTH_ENDPOINTS as auth_end } from "./config/endpoints";

export const httpClient = new HttpClient(() => resolveHttpBaseUrl(API_BASE_URL));
export const graphQLClient = new GraphQLClient(() =>
  resolveGraphQLEndpoint(API_BASE_URL)
);
