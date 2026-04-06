import type { User } from "@/_types/auth/user";

export type PreloadedState = {
  user?: {
    isAuthenticated: boolean;
    data?: User;
  };
};
