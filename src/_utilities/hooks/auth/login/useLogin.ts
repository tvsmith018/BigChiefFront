"use client";

import { useActionState, useEffect } from "react";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { useRouter } from "next/navigation";

import { loginAction } from "@/_services/auth/authservices";
import { storeUser } from "@/_store/reducers/user/userSlice";
import { User } from "@/_types/auth/user";

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
    dispatch(storeUser(state));
    router.push("/")
  }, [state]);

  return {
    state,
    action,
    pending,
  };
}
