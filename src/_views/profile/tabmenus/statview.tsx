"use client";

import { useMemo, useState } from "react";
import { Card } from "react-bootstrap";

type StatsMetricKey =
  | "postsCount"
  | "followersCount"
  | "followingCount"
  | "watchedVideosCount"
  | "ratedArticlesCount"
  | "uploadedImagesCount"
  | "averageRatingGiven"
  | "earningsTotalCents"
  | "lastActivityAt";

type UserProfileStatsMock = {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  watchedVideosCount: number;
  ratedArticlesCount: number;
  uploadedImagesCount: number;
  averageRatingGiven: number;
  earningsTotalCents: number;
  lastActivityAt: string;
};

const profileStats: UserProfileStatsMock = {
  postsCount: 34,
  followersCount: 12840,
  followingCount: 286,
  watchedVideosCount: 512,
  ratedArticlesCount: 148,
  uploadedImagesCount: 9,
  averageRatingGiven: 4.57,
  earningsTotalCents: 214990,
  lastActivityAt: "10 mins ago",
};

const audienceTrend = [
  { label: "Mon", followers: 120 },
  { label: "Tue", followers: 160 },
  { label: "Wed", followers: 145 },
  { label: "Thu", followers: 190 },
  { label: "Fri", followers: 220 },
  { label: "Sat", followers: 205 },
  { label: "Sun", followers: 260 },
];

const metricDetails: Record<StatsMetricKey, { title: string; hint: string; whyItMatters: string }> = {
  postsCount: {
    title: "Posts count",
    hint: "Total active profile posts published by the user.",
    whyItMatters: "Consistent posting improves discoverability and helps feed momentum.",
  },
  followersCount: {
    title: "Followers count",
    hint: "Current audience size that opted to follow this profile.",
    whyItMatters: "Follower growth is the primary signal for reach and influence.",
  },
  followingCount: {
    title: "Following count",
    hint: "How many profiles this user follows.",
    whyItMatters: "Following strategy can impact network effects and collaboration.",
  },
  watchedVideosCount: {
    title: "Watched videos count",
    hint: "Total watched video sessions tracked in history.",
    whyItMatters: "Shows user engagement depth and platform retention behavior.",
  },
  ratedArticlesCount: {
    title: "Rated articles count",
    hint: "How many article ratings this user submitted.",
    whyItMatters: "High rating activity can identify power-users and trend shapers.",
  },
  uploadedImagesCount: {
    title: "Uploaded images count",
    hint: "Number of images currently in profile gallery.",
    whyItMatters: "Visual content drives profile quality and click-through performance.",
  },
  averageRatingGiven: {
    title: "Average rating given",
    hint: "Average score submitted by this user across rated content.",
    whyItMatters: "Useful for understanding sentiment patterns and user preference bias.",
  },
  earningsTotalCents: {
    title: "Earnings total",
    hint: "Cumulative creator earnings represented in cents.",
    whyItMatters: "Key monetization KPI for incentive and creator-of-the-week logic.",
  },
  lastActivityAt: {
    title: "Last activity",
    hint: "Most recent tracked interaction from this user profile.",
    whyItMatters: "Fresh activity improves ranking potential and recommendation weight.",
  },
};

export default function StatsView() {
  const [activeMetric, setActiveMetric] = useState<StatsMetricKey>("followersCount");

  const maxFollowersInTrend = useMemo(
    () => Math.max(...audienceTrend.map((point) => point.followers)),
    [],
  );

  const engagementSegments = useMemo(() => {
    const postsWeight = profileStats.postsCount * 2;
    const watchWeight = profileStats.watchedVideosCount;
    const ratingsWeight = profileStats.ratedArticlesCount * 3;
    const total = postsWeight + watchWeight + ratingsWeight;
    return {
      posts: Math.round((postsWeight / total) * 100),
      watch: Math.round((watchWeight / total) * 100),
      ratings: Math.max(0, 100 - Math.round((postsWeight / total) * 100) - Math.round((watchWeight / total) * 100)),
    };
  }, []);

  const activeDetail = metricDetails[activeMetric];

  return (
    <div className="bc-stats-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-stats-hero">
        <Card.Body>
          <div className="bc-stats-hero__header">
            <div>
              <h4 className="mb-1">Performance dashboard</h4>
              <p className="mb-0">UserProfileStats mock snapshot for engagement, reach, and growth.</p>
            </div>
            <span className="bc-stats-hero__badge">Updated {profileStats.lastActivityAt}</span>
          </div>

          <div className="bc-stats-grid">
            <article className="bc-stats-metric">
              <div>
                <small>Posts</small>
                <h5>{profileStats.postsCount}</h5>
              </div>
              <button type="button" onClick={() => setActiveMetric("postsCount")} aria-label="Explain posts count">
                <i className="bi bi-info-circle" />
              </button>
            </article>

            <article className="bc-stats-metric is-highlight">
              <div>
                <small>Followers</small>
                <h5>{profileStats.followersCount.toLocaleString()}</h5>
              </div>
              <button type="button" onClick={() => setActiveMetric("followersCount")} aria-label="Explain followers count">
                <i className="bi bi-info-circle" />
              </button>
            </article>

            <article className="bc-stats-metric">
              <div>
                <small>Following</small>
                <h5>{profileStats.followingCount.toLocaleString()}</h5>
              </div>
              <button type="button" onClick={() => setActiveMetric("followingCount")} aria-label="Explain following count">
                <i className="bi bi-info-circle" />
              </button>
            </article>

            <article className="bc-stats-metric">
              <div>
                <small>Videos watched</small>
                <h5>{profileStats.watchedVideosCount.toLocaleString()}</h5>
              </div>
              <button type="button" onClick={() => setActiveMetric("watchedVideosCount")} aria-label="Explain watched videos">
                <i className="bi bi-info-circle" />
              </button>
            </article>
          </div>
        </Card.Body>
      </Card>

      <div className="bc-stats-layout">
        <Card className="bc-profile-panel-card bc-stats-chart-card">
          <Card.Body>
            <div className="bc-stats-chart-card__title">
              <h5 className="mb-0">Audience growth this week</h5>
              <button type="button" onClick={() => setActiveMetric("followersCount")}>
                Explain
              </button>
            </div>

            <div className="bc-stats-bars">
              {audienceTrend.map((point) => (
                <div className="bc-stats-bars__item" key={point.label}>
                  <div
                    className="bc-stats-bars__bar"
                    style={{ height: `${Math.max(14, Math.round((point.followers / maxFollowersInTrend) * 100))}%` }}
                  />
                  <span>{point.label}</span>
                </div>
              ))}
            </div>

            <div className="bc-stats-secondary">
              <article>
                <small>Rated articles</small>
                <h6>{profileStats.ratedArticlesCount}</h6>
                <button type="button" onClick={() => setActiveMetric("ratedArticlesCount")}>
                  <i className="bi bi-info-circle" />
                </button>
              </article>
              <article>
                <small>Uploaded images</small>
                <h6>{profileStats.uploadedImagesCount}</h6>
                <button type="button" onClick={() => setActiveMetric("uploadedImagesCount")}>
                  <i className="bi bi-info-circle" />
                </button>
              </article>
              <article>
                <small>Avg rating given</small>
                <h6>{profileStats.averageRatingGiven.toFixed(2)}</h6>
                <button type="button" onClick={() => setActiveMetric("averageRatingGiven")}>
                  <i className="bi bi-info-circle" />
                </button>
              </article>
            </div>
          </Card.Body>
        </Card>

        <Card className="bc-profile-panel-card bc-stats-insight">
          <Card.Body>
            <h5 className="mb-2">Metric explainer</h5>
            <h6>{activeDetail.title}</h6>
            <p className="mb-2">{activeDetail.hint}</p>
            <p className="mb-3">{activeDetail.whyItMatters}</p>

            <div className="bc-stats-donut-wrap">
              <div
                className="bc-stats-donut"
                style={{
                  background: `conic-gradient(#b66f2f 0 ${engagementSegments.posts}%, #8a4e2d ${engagementSegments.posts}% ${
                    engagementSegments.posts + engagementSegments.watch
                  }%, #d09a58 ${engagementSegments.posts + engagementSegments.watch}% 100%)`,
                }}
              >
                <span>Mix</span>
              </div>
              <ul>
                <li>
                  <i className="dot posts" /> Posts {engagementSegments.posts}%
                </li>
                <li>
                  <i className="dot watch" /> Watch {engagementSegments.watch}%
                </li>
                <li>
                  <i className="dot ratings" /> Ratings {engagementSegments.ratings}%
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="bc-stats-earnings"
              onClick={() => setActiveMetric("earningsTotalCents")}
            >
              <span>Earnings (total)</span>
              <strong>${(profileStats.earningsTotalCents / 100).toLocaleString()}</strong>
              <i className="bi bi-info-circle" />
            </button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}