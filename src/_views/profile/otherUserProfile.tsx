"use client";

import type { ProfileViewPayloadOther } from "@/_types/profile/profileViewPayload";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { PROFILE_AVATAR_PLACEHOLDER } from "@/_constants/profilePlaceholders";
import FeedView from "./tabmenus/feedview";
import PhotoView from "./tabmenus/photosview";
import FollowersView from "./tabmenus/followersview";
import { ProfileThreeColumnLayout, type ProfileActivityTabItem } from "./ProfilePageScaffold";

type ProfileTab = "Posts" | "Photos" | "Followers";

const activityTabs: ProfileActivityTabItem<ProfileTab>[] = [
  { icon: "bi-postcard", label: "Posts", tab: "Posts" },
  { icon: "bi bi-person-arms-up", label: "Followers", badge: "0", tab: "Followers" },
  { icon: "bi-images", label: "Photos", tab: "Photos" },
];

export default function OtherUserProfile({ profile }: Readonly<{ profile: ProfileViewPayloadOther }>) {
  const [tab, setTab] = useState<ProfileTab>("Posts");
  const avatarSrc = profile.user.avatarUrl ?? PROFILE_AVATAR_PLACEHOLDER;

  const primaryAction = (
    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
      <i className="bi bi-chat-right-dots-fill me-2" />
      {" "}
      Message Me
    </Button>
  );

  return (
    <ProfileThreeColumnLayout
      firstName={profile.user.firstname}
      lastName={profile.user.lastname}
      avatarSrc={avatarSrc}
      primaryAction={primaryAction}
      activityTabs={activityTabs}
      tab={tab}
      setTab={setTab}
    >
      {tab === "Posts" && <FeedView />}
      {tab === "Photos" && <PhotoView />}
      {tab === "Followers" && <FollowersView />}
    </ProfileThreeColumnLayout>
  );
}
