import type { ProfileMePayload } from "@/_types/profile/profileMePayload";
import type { MemberProfilePayload } from "@/_types/profile/memberProfilePayload";
import type {
  ProfileViewPayloadMe,
  ProfileViewPayloadOther,
} from "@/_types/profile/profileViewPayload";

function toDisplayAvatarUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
}

export function mapProfileMeToView(
  payload: ProfileMePayload
): ProfileViewPayloadMe {
  return {
    scope: "me",
    user: {
      id: payload.user.id,
      firstname: payload.user.firstname,
      lastname: payload.user.lastname,
      email: payload.user.email,
      avatarUrl: toDisplayAvatarUrl(payload.user.avatar ?? null),
      bio: payload.user.bio,
      dob: payload.user.dob,
    },
    settings: payload.settings,
    stats: payload.stats,
  };
}

export function mapMemberProfileToView(
  payload: MemberProfilePayload
): ProfileViewPayloadOther {
  return {
    scope: "other",
    user: {
      id: payload.user.id,
      firstname: payload.user.firstname,
      lastname: payload.user.lastname,
      email: payload.user.email,
      avatarUrl: toDisplayAvatarUrl(payload.user.avatarUrl ?? null),
    },
    settings: payload.settings,
    followers: payload.followers,
    following: payload.following,
    posts: payload.posts,
    images: payload.images,
  };
}
