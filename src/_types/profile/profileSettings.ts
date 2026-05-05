/**
 * Settings from REST `GET /profiles/me` (snake_case, API contract).
 */
export type ProfileSettings = {
  profile_is_public: boolean;
  allow_messages: boolean;
  show_activity_feed: boolean;
  show_watch_history: boolean;
  show_ratings: boolean;
  show_uploaded_images: boolean;
  receive_notifications: boolean;
  receive_marketing_notifications: boolean;
  disabled_at: string | null;
  delete_requested_at: string | null;
  metadata: Record<string, unknown>;
};

/**
 * `userProfileSettings` node from GraphQL (camelCase). Optional fields are nullable from API.
 */
export type ProfileSettingsNode = {
  id: string;
  profileIsPublic: boolean;
  allowMessages: boolean;
  showActivityFeed: boolean;
  showWatchHistory: boolean;
  showRatings: boolean;
  showUploadedImages: boolean;
  receiveNotifications: boolean;
  receiveMarketingNotifications: boolean;
  disabledAt?: string | null;
  deleteRequestedAt?: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};
