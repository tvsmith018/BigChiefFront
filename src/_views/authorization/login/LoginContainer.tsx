"use client";

import { useLogin } from "@/_utilities/hooks/auth/login/useLogin";
import { LoginForm } from "./forms/LoginForm";

export default function LoginContainer() {
  const { state, action, pending } = useLogin();

  return (
    <LoginForm
      action={action}
      pending={pending}
      errors={state?.errors}
      netError={state?.netError}
    />
  );
}
