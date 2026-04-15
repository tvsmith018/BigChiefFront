import type { SignupMultipartResult } from "@/_types/auth/signup/signupmultipartResult";

export type SignupConfirmInput = {
  confirmPassword: string;
  password: string;
  email: string;
  firstname: string;
  lastname: string;
  dob: Date | undefined;
  avatar?: File;
};

export function validateSignupConfirmInput(
  input: SignupConfirmInput
): SignupMultipartResult | null {
  const confirm = String(input.confirmPassword ?? "");
  if (!confirm) return { confirmError: ["Cannot be blanked!!!"] };
  if (!input.password) return { confirmError: ["Missing password state, try again."] };
  if (confirm !== input.password) return { confirmError: ["Passwords are not the same!!!!"] };
  if (!input.email) return { networkError: ["Missing email state, try again."] };
  if (!input.firstname) return { networkError: ["Missing firstname state, try again."] };
  if (!input.lastname) return { networkError: ["Missing lastname state, try again."] };
  if (!input.dob) return { networkError: ["Missing dob state, try again."] };
  return null;
}
