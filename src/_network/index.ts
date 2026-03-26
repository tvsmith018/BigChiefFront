import { HttpClient } from "./core/HttpClient";
import { GraphQLClient } from "./core/GraphQLClient";

import { API_BASE_URL, GRAPHQL_URL, AUTH_ENDPOINTS } from "./config/endpoints";

export const httpClient = new HttpClient("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com");
export const graphQLClient = new GraphQLClient("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/graphql/");
export const auth_end = AUTH_ENDPOINTS
