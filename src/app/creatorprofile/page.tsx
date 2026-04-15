import {
  DashboardActionCard,
  DashboardMetricCard,
  DashboardSidebar,
  DashboardTabs,
  DashboardWidgetTitle,
  type SharedNavItem,
} from "@/_views/account/SharedPanels";

const dashboardItems: SharedNavItem[] = [
  { icon: "bi-house-door-fill", label: "Dashboard", active: true },
  { icon: "bi-collection-play-fill", label: "Content" },
  { icon: "bi-bar-chart-fill", label: "Analytics" },
  { icon: "bi-cash-coin", label: "Earnings" },
  { icon: "bi-people-fill", label: "Audience" },
  { icon: "bi-star-fill", label: "Ratings & Reviews" },
  { icon: "bi-coin", label: "Monetization" },
  { icon: "bi-broadcast", label: "Live Stream" },
  { icon: "bi-journal-richtext", label: "Articles" },
  { icon: "bi-camera-video-fill", label: "Media Library" },
];

const topTabs = [
  { label: "Overview", active: true },
  { label: "Content" },
  { label: "Analytics" },
  { label: "Audience" },
  { label: "Earnings" },
  { label: "Payouts" },
  { label: "Settings" },
];

const statCards = [
  { label: "Total Views", value: "52,487", delta: "+12.5%" },
  { label: "Watch Time", value: "1,247.2hrs", delta: "+8.4%" },
  { label: "Subscribers", value: "6,382", delta: "+5.6%" },
  { label: "Avg. Rating", value: "4.8", delta: "4.6K Ratings" },
  { label: "Engagement", value: "8.9%", delta: "+0.6%" },
];

const topContent = [
  {
    title: "Breaking News: Local Events Recap",
    meta: "2.3K Views · 5 Comments · 4.8",
    length: "4:08",
    type: "Video",
  },
  {
    title: "Community Spotlight: Voices of the People",
    meta: "8.7K Views · 12 Comments · 4.9",
    length: "6:21",
    type: "Video",
  },
  {
    title: "Big Chief Exclusive Interview",
    meta: "12.1K Views · 24 Comments · 4.7",
    length: "9:12",
    type: "Video",
  },
  {
    title: "Culture & Music Showcase",
    meta: "3.2K Views · 8 Comments · 4.6",
    length: "Article",
    type: "Article",
  },
];

const recentContent = [
  {
    title: "Breaking News: Local Events Recap",
    status: "Published · 2h ago",
    views: "2.3K",
    engagement: "8.9%",
    rating: "4.8",
    earnings: "$48.60",
  },
  {
    title: "Community Spotlight: Voices of the People",
    status: "Published · 1d ago",
    views: "8.7K",
    engagement: "9.4%",
    rating: "4.9",
    earnings: "$142.30",
  },
  {
    title: "Big Chief Exclusive Interview",
    status: "Published · 3d ago",
    views: "12.1K",
    engagement: "8.2%",
    rating: "4.7",
    earnings: "$198.75",
  },
  {
    title: "Opinion: The Future of Entertainment",
    status: "Draft · 5d ago",
    views: "—",
    engagement: "—",
    rating: "—",
    earnings: "Continue",
  },
];

const creatorTools = [
  { icon: "bi-cloud-arrow-up-fill", label: "Upload Content", sublabel: "Video, Article, Image" },
  { icon: "bi-broadcast-pin", label: "Go Live", sublabel: "Start Live Stream" },
  { icon: "bi-pencil-square", label: "Write Article", sublabel: "Create New Post" },
  { icon: "bi-calendar-event-fill", label: "Scheduler", sublabel: "Plan & Publish" },
  { icon: "bi-camera-reels-fill", label: "Media Library", sublabel: "Manage Files" },
  { icon: "bi-briefcase-fill", label: "Brand Kit", sublabel: "Logos & Assets" },
];

const insightItems = [
  { label: "New Subscribers", value: "+382", delta: "+5.6%" },
  { label: "Returning Viewers", value: "68%", delta: "+2.9%" },
  { label: "Top Country", value: "United States" },
  { label: "Most Active Time", value: "7PM - 10PM" },
];

export default function Page() {
  return (
    <main className="bc-creator-page">
      <div className="container py-4 py-xl-5">
        <div className="row g-4">
          <div className="col-xl-3 d-none d-xl-block">
            <aside className="bc-creator-sidebar">
              <DashboardSidebar
                pageClass="bc-creator"
                brand="BIG CHIEF"
                items={dashboardItems}
                footer={
                  <button type="button" className="bc-creator-upload-btn">
                    <i className="bi bi-plus-lg" /> Upload Content
                  </button>
                }
              />
            </aside>
          </div>

          <div className="col-xl-9">
            <section className="bc-creator-hero bc-creator-shell">
              <div className="bc-creator-hero__content">
                <div className="bc-creator-avatar bc-creator-avatar--hero">TV</div>
                <div className="bc-creator-hero__copy">
                  <p className="bc-creator-kicker">Welcome back,</p>
                  <h1>
                    Terrance V. Smith <span><i className="bi bi-patch-check-fill" /></span>
                  </h1>
                  <p className="bc-creator-meta">Standard Creator · Member since 2023</p>
                </div>
              </div>

              <div className="bc-creator-hero__earnings bc-creator-shell bc-creator-shell--dark">
                <p>Earnings This Month</p>
                <h2>$1,247.25</h2>
                <span>Monthly Cycle · Next payout in 6 days</span>
                <button type="button" className="bc-creator-gold-btn">
                  View Earnings <i className="bi bi-arrow-right" />
                </button>
              </div>
            </section>

            <section className="bc-creator-stats">
              <div className="row g-3">
                {statCards.map((card) => (
                  <div className="col-6 col-lg-4 col-xxl" key={card.label}>
                    <DashboardMetricCard
                      pageClass="bc-creator"
                      label={card.label}
                      value={card.value}
                      delta={card.delta}
                    />
                  </div>
                ))}
              </div>
            </section>

            <DashboardTabs pageClass="bc-creator" tabs={topTabs} />

            <div className="row g-4 mt-1">
              <div className="col-12 col-xxl-8">
                <section className="bc-creator-shell bc-creator-chart-card">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Performance Overview" />

                  <div className="bc-creator-chart-tabs">
                    <button type="button">7D</button>
                    <button type="button" className="is-active">30D</button>
                    <button type="button">90D</button>
                    <button type="button">1Y</button>
                  </div>

                  <div className="bc-creator-chart">
                    <div className="bc-creator-chart__grid" />
                    <svg viewBox="0 0 640 240" className="bc-creator-chart__svg" aria-hidden="true">
                      <polyline
                        fill="none"
                        stroke="#2f241d"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="0,186 42,155 84,168 126,146 168,98 210,152 252,135 294,104 336,118 378,92 420,132 462,114 504,108 546,68 588,112 640,62"
                      />
                      <polyline
                        fill="none"
                        stroke="#c98a41"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="0,208 42,196 84,194 126,179 168,146 210,186 252,171 294,138 336,156 378,129 420,164 462,148 504,122 546,136 588,130 640,96"
                      />
                    </svg>
                    <div className="bc-creator-chart__peak">Peak: 6,248</div>
                  </div>

                  <div className="row g-3 mt-2">
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="bc-creator-shell bc-creator-mini-stat">
                        <span>Total Views</span>
                        <strong>52,487</strong>
                        <small>+12.5%</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="bc-creator-shell bc-creator-mini-stat">
                        <span>Impressions</span>
                        <strong>216,784</strong>
                        <small>+9.2%</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="bc-creator-shell bc-creator-mini-stat">
                        <span>Engagement</span>
                        <strong>8.9%</strong>
                        <small>+0.6%</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="bc-creator-shell bc-creator-mini-stat">
                        <span>Comments</span>
                        <strong>412</strong>
                        <small>+11.3%</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="bc-creator-shell bc-creator-mini-stat">
                        <span>Shares</span>
                        <strong>128</strong>
                        <small>+3.1%</small>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bc-creator-shell bc-creator-recent mt-4">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Recent Content" />

                  <div className="bc-creator-recent__head d-none d-lg-grid">
                    <span />
                    <span />
                    <span>Views</span>
                    <span>Engagement</span>
                    <span>Rating</span>
                    <span>Earnings</span>
                  </div>

                  <div className="bc-creator-recent__list">
                    {recentContent.map((item) => (
                      <div className="bc-creator-recent__row" key={item.title}>
                        <div className="bc-creator-thumb" />
                        <div className="bc-creator-recent__title">
                          <strong>{item.title}</strong>
                          <span>{item.status}</span>
                        </div>
                        <span>{item.views}</span>
                        <span>{item.engagement}</span>
                        <span>{item.rating}</span>
                        <span>{item.earnings}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-12 col-xxl-4">
                <section className="bc-creator-shell bc-creator-top-content">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Top Performing Content" action="See All" />
                  <div className="bc-creator-top-content__list">
                    {topContent.map((item) => (
                      <div className="bc-creator-top-content__item" key={item.title}>
                        <div className="bc-creator-thumb bc-creator-thumb--wide">
                          <span>{item.length}</span>
                        </div>
                        <div className="bc-creator-top-content__copy">
                          <strong>{item.title}</strong>
                          <span>{item.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bc-creator-shell bc-creator-payouts mt-4">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Earnings & Payouts" />
                  <span className="bc-creator-section-label">Current Balance</span>
                  <h3>$1,247.25</h3>
                  <p>Available: $247.25</p>
                  <button type="button" className="bc-creator-dark-btn">Request Payout</button>

                  <div className="bc-creator-payouts__history">
                    <div><span>Sep 2025</span><strong>$1,023.50</strong><em>Paid</em></div>
                    <div><span>Aug 2025</span><strong>$987.25</strong><em>Paid</em></div>
                    <div><span>Jul 2025</span><strong>$854.75</strong><em>Paid</em></div>
                  </div>
                </section>

                <section className="bc-creator-shell bc-creator-tools mt-4">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Creator Tools" />
                  <div className="row g-3">
                    {creatorTools.map((tool) => (
                      <div className="col-6" key={tool.label}>
                        <DashboardActionCard
                          pageClass="bc-creator"
                          icon={tool.icon}
                          label={tool.label}
                          sublabel={tool.sublabel}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bc-creator-shell bc-creator-insights mt-4">
                  <DashboardWidgetTitle pageClass="bc-creator" title="Growth Insights" />
                  <div className="bc-creator-insights__list">
                    {insightItems.map((item) => (
                      <div className="bc-creator-insights__item" key={item.label}>
                        <div>
                          <span>{item.label}</span>
                          {item.delta ? <small>{item.delta}</small> : null}
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
