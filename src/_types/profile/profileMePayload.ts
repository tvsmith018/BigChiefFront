import type { ProfileUser } from "./profileUser";
import type { ProfileSettings } from "./profileSettings";
import type { ProfileStats } from "./profileStats";

export type ProfileMePayload = {
  user: ProfileUser;
  settings: ProfileSettings;
  stats: ProfileStats;
};
