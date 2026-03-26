// _utilities/datatype/Auth/types/auth-state.ts
import { User } from "./user";

export interface AuthActionState {
  errors?: Record<string, string[]>;
  netError?: string;
}

export type LoginActionResult = User | AuthActionState | undefined;
