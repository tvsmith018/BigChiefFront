import type { ProfileFollowNode } from "./profileFollow";
import type { ProfileImageNode } from "./profileImage";
import type { ProfilePostNode } from "./profilePost";
import type { ProfileSettings, ProfileSettingsNode } from "./profileSettings";
import type { ProfileStats } from "./profileStats";

/**
 * Normalized user for shared profile layouts (`ProfilePageContent`, `OtherUserProfile`).
 * Avatar is always a display URL (or null), regardless of REST vs GraphQL source.
 */
export type ProfileViewUser = {
  id: string | number;
  firstname: string;
  lastname: string;
  email: string;
  avatarUrl: string | null;
  /** Present when `scope === "me"` (REST /profiles/me). */
  bio?: string;
  dob?: string | null;
};

/** Signed-in “my profile” view (from {@link ProfileMePayload} via mapper). */
export type ProfileViewPayloadMe = {
  scope: "me";
  user: ProfileViewUser;
  settings: ProfileSettings;
  stats: ProfileStats;
};

/** Another member’s profile (from {@link MemberProfilePayload} via mapper). */
export type ProfileViewPayloadOther = {
  scope: "other";
  user: ProfileViewUser;
  settings: ProfileSettingsNode | null;
  followers: ProfileFollowNode[];
  following: ProfileFollowNode[];
  posts: ProfilePostNode[];
  images: ProfileImageNode[];
};

/**
 * Single discriminated union for profile views; branch on `scope`.
 */
export type ProfileViewPayload = ProfileViewPayloadMe | ProfileViewPayloadOther;
