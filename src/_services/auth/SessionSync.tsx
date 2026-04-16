"use client";

import { useEffect, useRef } from "react";

import type { User } from "@/_types/auth/user";
import { logWarn } from "@/_utilities/observability/logger";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import { removeUser, storeUser } from "@/_store/reducers/user/userSlice";

type SessionResponse = {
  authenticated: boolean;
  user: User | null;
};

const HEARTBEAT_MS = 60_000;
const UNAUTH_STREAK_REQUIRED = 2;
const PROTECT_WINDOW_AFTER_AUTH_MS = 12_000;

function sameUser(a?: User, b?: User | null) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.firstname === b.firstname &&
    a.lastname === b.lastname &&
    a.avatar === b.avatar
  );
}

export function SessionSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const currentUser = useAppSelector((state) => state.user.data);
  const authTransitioning = useAppSelector((state) => state.app.authTransitioning);

  const unauthStreakRef = useRef(0);
  const lastAuthSuccessAtRef = useRef(Date.now());

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (authTransitioning) return;

      try {
        const res = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!active || !res.ok) return;

        const payload = (await res.json()) as SessionResponse;

        if (payload.authenticated && payload.user) {
          unauthStreakRef.current = 0;
          lastAuthSuccessAtRef.current = Date.now();

          if (!isAuthenticated || !sameUser(currentUser, payload.user)) {
            dispatch(storeUser(payload.user));
          }
          return;
        }

        if (!isAuthenticated) return;

        const withinProtectedWindow =
          Date.now() - lastAuthSuccessAtRef.current < PROTECT_WINDOW_AFTER_AUTH_MS;
        if (withinProtectedWindow) return;

        unauthStreakRef.current += 1;
        if (unauthStreakRef.current < UNAUTH_STREAK_REQUIRED) return;

        unauthStreakRef.current = 0;
        dispatch(removeUser());
      } catch {
        // Ignore transient network issues; next heartbeat/focus will reconcile.
        logWarn("session_sync_fetch_failed");
      }
    };

    const onFocus = () => {
      void sync();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    };

    void sync();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    }, HEARTBEAT_MS);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dispatch, isAuthenticated, currentUser, authTransitioning]);

  return null;
}