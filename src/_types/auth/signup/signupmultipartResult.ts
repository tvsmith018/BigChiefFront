import type { User } from "../user";

export type SignupMultipartResult =
  | { ok: true; user: User }
  | { confirmError: string[] }
  | { networkError: string[] };
