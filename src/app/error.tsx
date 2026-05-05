"use client";

import { useEffect } from "react";

import { logError } from "@/_utilities/observability/logger";

interface AppErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppErrorPage({
  error,
  reset,
}: Readonly<AppErrorPageProps>) {
  useEffect(() => {
    logError("route_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Something went wrong.</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
