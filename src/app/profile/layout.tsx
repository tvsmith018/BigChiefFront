import type { ReactNode } from "react";

import { requireAuth } from "@/_services/auth/authproxy";

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth("/auth");

  return <div className="bc-profile-layout">{children}</div>;
}
