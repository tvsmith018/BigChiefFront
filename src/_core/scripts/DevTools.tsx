"use client";

import ErudaScript from "@/_utilities/eruda/eruda";

export function DevTools() {
  if (process.env.NODE_ENV !== "development") return null;
  return <ErudaScript />;
}
