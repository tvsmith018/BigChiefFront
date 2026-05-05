import type { ProfileFollowNode } from "./profileFollow";
import type { ProfileImageNode } from "./profileImage";
import type { ProfilePostNode } from "./profilePost";
import type { ProfileSettingsNode } from "./profileSettings";
import type { ProfileUserNode } from "./profileUser";

export type { ProfileUserNode } from "./profileUser";
export type { ProfileSettingsNode } from "./profileSettings";
export type { ProfileFollowNode } from "./profileFollow";
export type { ProfilePostNode } from "./profilePost";
export type { ProfileImageNode } from "./profileImage";

/**
 * Member profile bundle from GraphQL (`ProfileService.getMemberProfile`).
 */
export type MemberProfilePayload = {
  user: ProfileUserNode;
  settings: ProfileSettingsNode | null;
  followers: ProfileFollowNode[];
  following: ProfileFollowNode[];
  posts: ProfilePostNode[];
  images: ProfileImageNode[];
};
