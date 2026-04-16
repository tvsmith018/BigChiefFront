import type { Metadata } from "next";

import ProfilePageContent from "../../_views/profile/ProfilePageContent";
import { ProfileService } from "@/_services/profiles/profileservices";
import { getSessionAccessToken } from "@/_services/auth/authproxy";
import type { ProfileMePayload } from "@/_types/profile/profileMePayload";
import type { ProfileMeApiResponse } from "@/_types/profile/profileMeApiResponse";

function getProfileMeErrorMessage(
  r: Extract<ProfileMeApiResponse, { success: false }>
): string {
  if (typeof r.message === "string") return r.message;
  if (typeof r.detail === "string") return r.detail;
  return "Unable to load profile.";
}

function resolveMetadataBase(): URL | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!raw) return undefined;

  try {
    return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
  } catch {
    return undefined;
  }
}

const SITE_NAME = "Big Chief Ent";
const PAGE_TITLE = `My Profile | ${SITE_NAME}`;
const DESCRIPTION =
  "Manage your Big Chief Ent profile, saved articles, and account preferences. Sign-in required; your activity and settings stay private to your account.";

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: PAGE_TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: "Hip-hop Blog",
  keywords: [
    "Big Chief Ent",
    "BCE",
    "profile",
    "account",
    "saved articles",
    "member profile",
    "hip-hop blog",
    "Raleigh NC",
  ],
  authors: [{ name: "Terrance V. Smith" }],
  creator: "Terrance V. Smith",
  publisher: "Software Innovation LLC",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/profile",
    siteName: SITE_NAME,
    title: PAGE_TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: DESCRIPTION,
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  referrer: "strict-origin-when-cross-origin",
};

export default async function Page() {
  const access = await getSessionAccessToken();
  const profileResponse = await ProfileService.getProfileMe(
    access ? { headers: { Authorization: `Bearer ${access}` } } : undefined
  );

  if (profileResponse.success === true) {
    return <ProfilePageContent profile={profileResponse.data}/>;
  }

  return <div>Error: {getProfileMeErrorMessage(profileResponse)}</div>;
}
