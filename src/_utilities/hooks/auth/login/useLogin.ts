"use client";

import { useActionState, useEffect } from "react";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { useRouter } from "next/navigation";

import { loginAction } from "@/_services/auth/authactions";
import { storeUser } from "@/_store/reducers/user/userSlice";

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [state, action, pending] = useActionState(
    loginAction,
    undefined
  );

  useEffect(() => {
    if (!state) return;
    if (state.errors || state.netError) return;
    if (!("firstname" in state || "lastname" in state || "id" in state)) return;
    dispatch(storeUser(state));
    router.push("/")
  }, [dispatch, router, state]);

  return {
    state,
    action,
    pending,
  };
}
