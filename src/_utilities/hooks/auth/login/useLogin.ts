"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/_services/auth/authactions";
import type { User } from "@/_types/auth/user";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { storeUser } from "@/_store/reducers/user/userSlice";

function extractLoggedInUser(state: unknown): User | null {
  if (!state || typeof state !== "object") return null;

  const candidate = state as Record<string, unknown>;

  if (candidate.errors || candidate.netError) return null;

  if (candidate.success === true && candidate.data && typeof candidate.data === "object") {
    return candidate.data as User;
  }

  if ("firstname" in candidate || "lastname" in candidate || "id" in candidate) {
    return candidate as User;
  }

  return null;
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [state, action, pending] = useActionState(loginAction, undefined);

  useEffect(() => {
    const user = extractLoggedInUser(state);
    if (!user) return;

    dispatch(storeUser(user));

    // Move immediately, then refresh server components/cookies-backed state.
    router.replace("/profile");
    router.refresh();
  }, [dispatch, router, state]);

  return {
    state,
    action,
    pending,
  };
}