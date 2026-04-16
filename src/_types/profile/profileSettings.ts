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
