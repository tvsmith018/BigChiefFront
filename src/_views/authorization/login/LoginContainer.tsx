"use client";

import { useLogin } from "@/_utilities/hooks/auth/login/useLogin";
import { LoginForm } from "./forms/LoginForm";

export default function LoginContainer() {
  const { state, action, pending } = useLogin();
  const errors =
    state &&
    "errors" in state &&
    state.errors &&
    typeof state.errors !== "string"
      ? state.errors
      : undefined;
  const netError = state && "netError" in state ? state.netError : undefined;

  return (
    <LoginForm
      action={action}
      pending={pending}
      errors={errors}
      netError={netError}
    />
  );
}
