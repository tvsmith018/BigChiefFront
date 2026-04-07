import { HttpClient } from "./core/HttpClient";
import { GraphQLClient } from "./core/GraphQLClient";

import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  resolveGraphQLEndpoint,
} from "./config/endpoints";

export const httpClient = new HttpClient(API_BASE_URL);
export const graphQLClient = new GraphQLClient(() =>
  resolveGraphQLEndpoint(API_BASE_URL)
);
export const auth_end = AUTH_ENDPOINTS;
