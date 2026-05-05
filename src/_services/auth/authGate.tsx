"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";

type Mode = "guest" | "auth";

interface AuthGateProps {
  children: React.ReactNode;
  mode: Mode;
}

export function AuthGate({
  children,
  mode,
}: Readonly<AuthGateProps>) {
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
    }
  }, [isHydrated, isAuthenticated, mode, router]);

  if (!isHydrated) return null;

  if (mode === "guest" && isAuthenticated) return null;
  if (mode === "auth" && !isAuthenticated) return null;

  return <>{children}</>;
}