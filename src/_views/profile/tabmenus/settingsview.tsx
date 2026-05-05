"use client";

import { useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

type ProfileSettingsDraft = {
  profileIsPublic: boolean;
  allowMessages: boolean;
  showActivityFeed: boolean;
  showWatchHistory: boolean;
  showRatings: boolean;
  showUploadedImages: boolean;
  receiveNotifications: boolean;
  receiveMarketingNotifications: boolean;
};

type SettingRow = {
  key: keyof ProfileSettingsDraft;
  title: string;
  description: string;
  defaultValue: boolean;
};

const settingsRows: SettingRow[] = [
  {
    key: "profileIsPublic",
    title: "Public profile",
    description: "Let other users discover your profile and view allowed sections.",
    defaultValue: true,
  },
  {
    key: "allowMessages",
    title: "Allow direct messages",
    description: "Allow users to start new conversations with you.",
    defaultValue: true,
  },
  {
    key: "showActivityFeed",
    title: "Show activity feed",
    description: "Display your profile feed posts on your public profile.",
    defaultValue: true,
  },
  {
    key: "showWatchHistory",
    title: "Show watch history",
    description: "Show watched article history to viewers who can access your profile.",
    defaultValue: true,
  },
  {
    key: "showRatings",
    title: "Show ratings",
    description: "Display article ratings and rating summary activity.",
    defaultValue: true,
  },
  {
    key: "showUploadedImages",
    title: "Show uploaded images",
    description: "Display your uploaded photos gallery to profile viewers.",
    defaultValue: true,
  },
  {
    key: "receiveNotifications",
    title: "Receive notifications",
    description: "Get alerts for comments, replies, mentions, and message activity.",
    defaultValue: true,
  },
  {
    key: "receiveMarketingNotifications",
    title: "Receive marketing notifications",
    description: "Receive platform announcements and campaign opportunities.",
    defaultValue: false,
  },
];

const initialSettings = settingsRows.reduce<ProfileSettingsDraft>(
  (draft, row) => ({ ...draft, [row.key]: row.defaultValue }),
  {} as ProfileSettingsDraft,
);

const visibleSectionLabels: Partial<Record<keyof ProfileSettingsDraft, string>> = {
  showActivityFeed: "Activity feed",
  showWatchHistory: "Watch history",
  showRatings: "Ratings",
  showUploadedImages: "Uploaded images",
};

type PreviewPill = {
  key: keyof ProfileSettingsDraft;
  label: string;
  onText: string;
  offText: string;
};

const previewPills: PreviewPill[] = [
  { key: "profileIsPublic", label: "Profile", onText: "Public", offText: "Private" },
  { key: "allowMessages", label: "Messages", onText: "Allowed", offText: "Blocked" },
  { key: "receiveNotifications", label: "Notifications", onText: "On", offText: "Off" },
  { key: "receiveMarketingNotifications", label: "Marketing", onText: "On", offText: "Off" },
];

export default function SettingsView() {
  const [settings, setSettings] = useState<ProfileSettingsDraft>(initialSettings);

  function toggleSetting(key: keyof ProfileSettingsDraft) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  function resetToDefault() {
    setSettings(initialSettings);
  }

  const visibleSections = useMemo(() => {
    return settingsRows
      .filter((row) => Boolean(visibleSectionLabels[row.key]) && settings[row.key])
      .map((row) => visibleSectionLabels[row.key] as string);
  }, [settings]);

  return (
    <div className="bc-settings-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-settings-card">
        <Card.Body>
          <div className="bc-settings-card__header">
            <div>
              <h4 className="mb-1">Profile settings</h4>
              <p className="mb-0">Local preview only for now. No backend changes are saved yet.</p>
            </div>
            <Button type="button" variant="light" className="bc-settings-card__reset" onClick={resetToDefault}>
              Reset
            </Button>
          </div>

          <div className="bc-settings-list">
            {settingsRows.map((row) => (
              <div key={row.key} className="bc-settings-item">
                <div>
                  <h6>{row.title}</h6>
                  <p className="mb-0">{row.description}</p>
                </div>
                <Form.Check
                  type="switch"
                  id={`setting-${row.key}`}
                  checked={settings[row.key]}
                  onChange={() => toggleSetting(row.key)}
                  aria-label={row.title}
                />
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card className="bc-profile-panel-card bc-settings-preview">
        <Card.Body>
          <h5 className="mb-2">Profile visibility preview</h5>
          <p className="mb-3">This mock view shows what sections would be visible with current toggles.</p>

          <div className="bc-settings-preview__status">
            {previewPills.map((pill) => (
              <span key={pill.key} className={`bc-settings-pill ${settings[pill.key] ? "is-on" : ""}`}>
                {pill.label} {settings[pill.key] ? pill.onText : pill.offText}
              </span>
            ))}
          </div>

          <div className="bc-settings-preview__sections">
            {visibleSections.length > 0 ? (
              visibleSections.map((section) => <span key={section}>{section}</span>)
            ) : (
              <span className="is-empty">No profile sections are visible.</span>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}