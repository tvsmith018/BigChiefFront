import { User } from "../user";

export type SignupResponse = {
  data?: string;
  message?: string;
  success?: boolean;
};

export type SignupFieldErrors = {
  email?: string[];
  firstname?: string[];
  lastname?: string[];
  dob?: string[];
};

/** Profile fields from /me/ after auto-login (omit User.error-shaped keys that clash with SignupStateTemp.errors). */
export type SignupStateUserFields = Partial<Omit<User, "errors" | "netError">>;
