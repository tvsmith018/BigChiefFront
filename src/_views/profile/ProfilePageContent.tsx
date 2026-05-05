"use client";

import { useState } from "react";
import { Button } from "react-bootstrap";
import {
  ProfileListCard,
  ProfileMiniInfoCard,
} from "@/_views/account/SharedPanels";

import { PROFILE_AVATAR_PLACEHOLDER } from "@/_constants/profilePlaceholders";
import type { ProfileViewPayloadMe } from "@/_types/profile/profileViewPayload";
import FeedView from "./tabmenus/feedview";
import HistoryView from "./tabmenus/historyview";
import MessageView from "./tabmenus/messageview";
import PhotoView from "./tabmenus/photosview";
import SettingsView from "./tabmenus/settingsview";
import StatsView from "./tabmenus/statview";
import FollowersView from "./tabmenus/followersview";
import { ProfileThreeColumnLayout, type ProfileActivityTabItem } from "./ProfilePageScaffold";

type ProfileTab =
  | "Feed"
  | "Post"
  | "Messages"
  | "Notifications"
  | "History"
  | "Stats"
  | "Photos"
  | "Settings"
  | "Followers";

const activityTabs: ProfileActivityTabItem<ProfileTab>[] = [
  { icon: "bi-newspaper", label: "The Feed", tab: "Feed" },
  { icon: "bi-postcard", label: "My Post", tab: "Post" },
  { icon: "bi-chat-right-dots-fill", label: "Messages", badge: "0", tab: "Messages" },
  { icon: "bi bi-person-arms-up", label: "Followers", badge: "0", tab: "Followers" },
  { icon: "bi-eye", label: "Watch History", tab: "History" },
  { icon: "bi-graph-up", label: "My Stats", tab: "Stats" },
  { icon: "bi-images", label: "Photos", tab: "Photos" },
  { icon: "bi-gear-fill", label: "Account Settings", tab: "Settings" },
];

const accountCenterItems = [
  { icon: "bi-gear-fill", label: "Creator Account" },
  { icon: "bi-credit-card-2-front-fill", label: "Advertising Account" },
];

export default function ProfilePageContent({ profile }: Readonly<{ profile: ProfileViewPayloadMe }>) {
  const [tab, setTab] = useState<ProfileTab>("Feed");
  const avatarSrc = profile.user.avatarUrl ?? PROFILE_AVATAR_PLACEHOLDER;

  const primaryAction = (
    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
      <i className="bi bi-pencil-fill me-2" />
      {" "}
      Edit Profile
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
      sidebarNavPrefix={
        <div className="bc-profile-side-search">
          <span>
            Hi {profile.user.firstname} {profile.user.lastname}...
          </span>
        </div>
      }
      sidebarAfterNav={
        <ProfileMiniInfoCard
          icon="bi-bell"
          title="Notifications"
          value="Whats his name responded to Comment"
        />
      }
      rightAsideExtra={<ProfileListCard title="Choose Destiny" items={accountCenterItems} />}
    >
      {tab === "Feed" && <FeedView />}
      {tab === "Post" && <FeedView />}
      {tab === "Messages" && <MessageView />}
      {tab === "History" && <HistoryView />}
      {tab === "Stats" && <StatsView />}
      {tab === "Photos" && <PhotoView />}
      {tab === "Settings" && <SettingsView />}
      {tab === "Followers" && <FollowersView />}
    </ProfileThreeColumnLayout>
  );
}
