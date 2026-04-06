import { HttpClient } from "./core/HttpClient";
import { GraphQLClient } from "./core/GraphQLClient";

import { API_BASE_URL, GRAPHQL_URL, AUTH_ENDPOINTS } from "./config/endpoints";

export const httpClient = new HttpClient(API_BASE_URL);
export const graphQLClient = new GraphQLClient(GRAPHQL_URL);
export const auth_end = AUTH_ENDPOINTS;
