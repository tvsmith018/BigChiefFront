"use client";

import { useEffect } from "react";

import { logError } from "@/_utilities/observability/logger";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    logError("global_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: "1rem" }}>
          <h2>Unexpected application error.</h2>
          <button type="button" onClick={() => reset()}>
            Reload view
          </button>
        </div>
      </body>
    </html>
  );
}
