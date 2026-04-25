import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: false,
    setupFiles: [path.join(dir, "vitest.setup.ts")],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      reportsDirectory: "coverage",
      reportOnFailure: true,
      include: [
        "src/_services/auth/signup/signupValidation.ts",
        "src/_services/auth/auth.helpers.ts",
        "src/_network/core/HttpClient.ts",
        "src/_network/config/endpoints.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
      thresholds: {
        lines: 85,
        branches: 78,
        functions: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dir, "src"),
    },
  },
});
