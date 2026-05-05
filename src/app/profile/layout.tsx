import type { ReactNode } from "react";

import { requireAuth } from "@/_services/auth/authproxy";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({
  children,
}: Readonly<ProfileLayoutProps>) {
  await requireAuth("/auth");

  return <div className="bc-profile-layout">{children}</div>;
}
