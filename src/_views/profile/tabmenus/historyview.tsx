"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Form } from "react-bootstrap";

type ArticleViewSource = "web" | "mobile" | "api" | "embed" | "other";

type ArticleHistoryItem = {
  id: number;
  source: ArticleViewSource;
  isCounted: boolean;
  isUnique: boolean;
  watchedSeconds: number;
  createdAtLabel: string;
  sessionKey?: string | null;
  article: {
    id: string;
    title: string;
    category: string;
    badgeColor: string;
    briefSummary: string;
    image4x3Url: string;
    authorName: string;
    viewsCount: number;
    uniqueViewsCount: number;
    countedViewsCount: number;
    lastViewedAtLabel: string;
  };
};

const mockHistory: ArticleHistoryItem[] = [
  {
    id: 1,
    source: "web",
    isCounted: true,
    isUnique: true,
    watchedSeconds: 246,
    createdAtLabel: "Today, 10:14 AM",
    sessionKey: "sess_7fce3a",
    article: {
      id: "a101",
      title: "Inside The Creator Economy Shift",
      category: "Business",
      badgeColor: "bg-primary",
      briefSummary: "A breakdown of how creator-led platforms are changing modern media growth.",
      image4x3Url: "/images/4x3placeholder.png",
      authorName: "Terrance Smith",
      viewsCount: 12644,
      uniqueViewsCount: 8932,
      countedViewsCount: 7775,
      lastViewedAtLabel: "10:14 AM",
    },
  },
  {
    id: 2,
    source: "mobile",
    isCounted: true,
    isUnique: false,
    watchedSeconds: 96,
    createdAtLabel: "Today, 8:41 AM",
    sessionKey: "sess_7fce3a",
    article: {
      id: "a102",
      title: "How Indie Brands Build Loyal Communities",
      category: "Marketing",
      badgeColor: "bg-warning",
      briefSummary: "Community-first growth loops that help new brands survive and scale.",
      image4x3Url: "/images/4x3placeholder.png",
      authorName: "Alicia Stone",
      viewsCount: 8270,
      uniqueViewsCount: 5441,
      countedViewsCount: 5128,
      lastViewedAtLabel: "8:41 AM",
    },
  },
  {
    id: 3,
    source: "web",
    isCounted: false,
    isUnique: false,
    watchedSeconds: 33,
    createdAtLabel: "Yesterday, 11:22 PM",
    sessionKey: "sess_7fce3a",
    article: {
      id: "a103",
      title: "Monetizing Long-Form Video in 2026",
      category: "Media",
      badgeColor: "bg-danger",
      briefSummary: "Practical options for creator monetization beyond standard ad revenue.",
      image4x3Url: "/images/4x3placeholder.png",
      authorName: "Marcus Reed",
      viewsCount: 19774,
      uniqueViewsCount: 11903,
      countedViewsCount: 10988,
      lastViewedAtLabel: "Yesterday",
    },
  },
];

function sourceLabel(source: ArticleViewSource) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function formatWatchTime(seconds: number) {
  if (seconds < 60) return `${seconds}s watched`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  if (rem === 0) return `${mins}m watched`;
  return `${mins}m ${rem}s watched`;
}

export default function HistoryView() {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | ArticleViewSource>("all");

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mockHistory.filter((entry) => {
      const passSource = sourceFilter === "all" || entry.source === sourceFilter;
      const passQuery =
        normalizedQuery.length === 0 ||
        entry.article.title.toLowerCase().includes(normalizedQuery) ||
        entry.article.category.toLowerCase().includes(normalizedQuery) ||
        entry.article.authorName.toLowerCase().includes(normalizedQuery);
      return passSource && passQuery;
    });
  }, [query, sourceFilter]);

  const totals = useMemo(() => {
    return filteredHistory.reduce(
      (acc, item) => {
        acc.events += 1;
        acc.seconds += item.watchedSeconds;
        if (item.isUnique) acc.unique += 1;
        if (item.isCounted) acc.counted += 1;
        return acc;
      },
      { events: 0, seconds: 0, unique: 0, counted: 0 },
    );
  }, [filteredHistory]);

  return (
    <div className="bc-history-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-history-overview">
        <Card.Body>
          <div className="bc-history-overview__header">
            <div>
              <h4 className="mb-1">Watch history</h4>
              <p className="mb-0">Track what you viewed using the ArticleView event flow.</p>
            </div>
            <span className="bc-history-overview__total">{totals.events} events</span>
          </div>

          <div className="bc-history-overview__stats">
            <span>{formatWatchTime(totals.seconds)}</span>
            <span>{totals.unique} unique</span>
            <span>{totals.counted} counted</span>
          </div>

          <div className="bc-history-overview__filters">
            <Form.Control
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search viewed articles..."
            />
            <Form.Select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as "all" | ArticleViewSource)}
            >
              <option value="all">All sources</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="api">API</option>
              <option value="embed">Embed</option>
              <option value="other">Other</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      {filteredHistory.length > 0 ? (
        filteredHistory.map((entry) => (
          <Card key={entry.id} className="bc-profile-panel-card bc-history-card">
            <Card.Body>
              <div className="bc-history-card__top">
                <span className={`badge ${entry.article.badgeColor}`}>{entry.article.category}</span>
                <small>{entry.createdAtLabel}</small>
              </div>

              <div className="bc-history-card__main">
                <img src={entry.article.image4x3Url} alt={entry.article.title} />
                <div>
                  <h5>{entry.article.title}</h5>
                  <p>{entry.article.briefSummary}</p>
                  <div className="bc-history-card__meta">
                    <span>
                      <i className="bi bi-person" /> {entry.article.authorName}
                    </span>
                    <span>
                      <i className="bi bi-clock" /> {formatWatchTime(entry.watchedSeconds)}
                    </span>
                    <span>
                      <i className="bi bi-hdd-network" /> {sourceLabel(entry.source)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bc-history-card__analytics">
                <span>
                  <strong>{entry.article.viewsCount.toLocaleString()}</strong> views
                </span>
                <span>
                  <strong>{entry.article.uniqueViewsCount.toLocaleString()}</strong> unique
                </span>
                <span>
                  <strong>{entry.article.countedViewsCount.toLocaleString()}</strong> counted
                </span>
                <span className={`bc-history-pill ${entry.isUnique ? "is-on" : ""}`}>unique event</span>
                <span className={`bc-history-pill ${entry.isCounted ? "is-on" : ""}`}>counted event</span>
              </div>

              <div className="bc-history-card__actions">
                <small>Last viewed {entry.article.lastViewedAtLabel}</small>
                <Link href={`/articles/details/${entry.article.id}`} className="btn bc-profile-btn">
                  Open article
                </Link>
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card className="bc-profile-panel-card">
          <Card.Body className="bc-history-empty">
            <i className="bi bi-clock-history" />
            <p className="mb-0">No watched articles match your filters.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}