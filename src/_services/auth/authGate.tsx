"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";

type Mode = "guest" | "auth";

export function AuthGate({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: Mode;
}) {
  const router = useRouter();

  const isHydrated = useAppSelector((state) => state.app.isHydrated);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    if (!isHydrated) return;

    if (mode === "guest" && isAuthenticated) {
      router.replace("/");
      return;
    }

    if (mode === "auth" && !isAuthenticated) {
      router.replace("/auth");
      return;
    }
  }, [isHydrated, isAuthenticated, mode, router]);

  if (!isHydrated) return null;

  if (mode === "guest" && isAuthenticated) return null;
  if (mode === "auth" && !isAuthenticated) return null;

  return <>{children}</>;
}