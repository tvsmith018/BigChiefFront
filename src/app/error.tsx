"use client";

import { useEffect } from "react";

import { logError } from "@/_utilities/observability/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
