"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { storeUser, removeUser } from "@/_store/reducers/user/userSlice";
import { PreloadedState } from "@/_store/preloader";

export function SessionBootstrap({preloadedState}:{preloadedState?: PreloadedState;}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (preloadedState?.user?.isAuthenticated) {
      dispatch(storeUser({ data:preloadedState?.user?.data.user }));
    }
    else {
      dispatch(removeUser());
    }
  },[]);

  return null;
}