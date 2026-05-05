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
const GUEST_HEARTBEAT_MS = 300_000;
const UNAUTH_STREAK_REQUIRED = 2;
const PROTECT_WINDOW_AFTER_AUTH_MS = 12_000;
const SESSION_SYNC_MIN_GAP_MS = 4_000;
const INITIAL_SYNC_JITTER_MS = 3_000;

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

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

export function SessionSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const currentUser = useAppSelector((state) => state.user.data);
  const authTransitioning = useAppSelector((state) => state.app.authTransitioning);

  const unauthStreakRef = useRef(0);
  const lastAuthSuccessAtRef = useRef(Date.now());
  const lastSyncAtRef = useRef(0);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (authTransitioning) return;
      if (syncInFlightRef.current) return;
      if (Date.now() - lastSyncAtRef.current < SESSION_SYNC_MIN_GAP_MS) return;

      syncInFlightRef.current = true;
      lastSyncAtRef.current = Date.now();

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

        // Server can signal authenticated via cookies while user payload is still resolving.
        // Avoid forcing logout in this transient state.
        if (payload.authenticated && !payload.user) {
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
      } finally {
        syncInFlightRef.current = false;
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

    const initialDelayMs = randomInt(INITIAL_SYNC_JITTER_MS);
    const initialTimer = window.setTimeout(() => {
      void sync();
    }, initialDelayMs);

    const heartbeatMs = isAuthenticated ? HEARTBEAT_MS : GUEST_HEARTBEAT_MS;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    }, heartbeatMs);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dispatch, isAuthenticated, currentUser, authTransitioning]);

  return null;
}