import {
  DashboardMetricCard,
  DashboardSidebar,
  DashboardTabs,
  DashboardWidgetTitle,
  type SharedNavItem,
} from "@/_components/account/SharedPanels";

const partnerNavItems: SharedNavItem[] = [
  { icon: "bi-house-door-fill", label: "Dashboard", active: true },
  { icon: "bi-badge-ad-fill", label: "Content" },
  { icon: "bi-bar-chart-fill", label: "Analytics" },
  { icon: "bi-file-earmark-text-fill", label: "Reports" },
  { icon: "bi-wallet2", label: "Billing" },
  { icon: "bi-gear-fill", label: "Settings" },
];

const partnerTabs = [
  { label: "Dashboard", active: true },
  { label: "Content" },
  { label: "Analytics" },
  { label: "Campaigns" },
  { label: "Reports" },
  { label: "Billing" },
];

const partnerStats = [
  { label: "Total Views", value: "216,784" },
  { label: "Today's Clicks", value: "1,942", delta: "+9.4%" },
  { label: "Avg. CTR", value: "2.6%" },
];

const accountOverview = [
  { label: "Total Impressions", value: "216,784", delta: "+12.5% Last Week" },
  { label: "Today's Clicks", value: "1,942", delta: "+Yesterday" },
  { label: "Avg. CTR", value: "2.6%", delta: "+0.2% Rating" },
];

const activeCampaigns = [
  {
    title: "Drive Traffic to E-commerce Site",
    meta: "54.8k Impressions",
    cpc: "$2.75",
    volume: "54.8k",
    gain: "+$150.95",
  },
  {
    title: "Spring Sale Promotion",
    meta: "28.4k Today · 105 Comments",
    cpc: "$3.00",
    volume: "28.4k",
    gain: "+$85.25",
  },
];

const quickActions = [
  { icon: "bi-sliders", label: "Placement Controls" },
  { icon: "bi-bar-chart-line-fill", label: "View Reports" },
  { icon: "bi-wallet-fill", label: "Manage Funds" },
  { icon: "bi-receipt-cutoff", label: "View Billing" },
];

export default function Page() {
  return (
    <main className="bc-partner-page">
      <div className="container py-4 py-xl-5">
        <div className="row g-4">
          <div className="col-xl-3 d-none d-xl-block">
            <aside className="bc-partner-sidebar">
              <DashboardSidebar
                pageClass="bc-partner"
                brand="BIG CHIEF"
                items={partnerNavItems}
                footer={
                  <button type="button" className="bc-partner-gold-btn">
                    Create New Campaign
                  </button>
                }
              />
            </aside>
          </div>

          <div className="col-xl-9">
            <section className="bc-partner-hero bc-partner-shell">
              <div className="bc-partner-hero__main">
                <div className="bc-partner-avatar">BD</div>
                <div className="bc-partner-hero__copy">
                  <p className="bc-partner-kicker">nycona Geils</p>
                  <h1>
                    Brian Davis <span><i className="bi bi-patch-check-fill" /></span>
                  </h1>
                  <p className="bc-partner-meta">Advertising Partner</p>
                </div>
              </div>

              <div className="bc-partner-hero__stats">
                {partnerStats.map((stat) => (
                  <DashboardMetricCard
                    pageClass="bc-partner"
                    label={stat.label}
                    value={stat.value}
                    delta={stat.delta}
                    key={stat.label}
                  />
                ))}
              </div>

              <div className="bc-partner-month bc-partner-shell bc-partner-shell--dark">
                <span>This Month</span>
                <h2>$2,450.75</h2>
                <button type="button" className="bc-partner-gold-btn">
                  Add Funds <i className="bi bi-arrow-right" />
                </button>
              </div>
            </section>

            <DashboardTabs pageClass="bc-partner" tabs={partnerTabs} />

            <div className="row g-4 mt-1">
              <div className="col-12 col-xxl-8">
                <section className="bc-partner-shell bc-partner-overview">
                  <DashboardWidgetTitle pageClass="bc-partner" title="Account Overview" action="Last 7 days" />
                  <div className="row g-3">
                    {accountOverview.map((item) => (
                      <div className="col-md-4" key={item.label}>
                        <div className="bc-partner-shell bc-partner-mini-card">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                          <small>{item.delta}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bc-partner-shell bc-partner-chart-card mt-4">
                  <DashboardWidgetTitle pageClass="bc-partner" title="Campaign Performance" action="Last 7 days" />
                  <div className="bc-partner-chart">
                    <div className="bc-partner-chart__grid" />
                    <div className="bc-partner-chart__bars">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                        <div className="bc-partner-chart__bar-group" key={`${day}-${index}`}>
                          <div
                            className={`bc-partner-chart__bar ${index === 8 ? "is-highlight" : ""}`}
                            style={{ height: `${45 + (index % 7) * 12}px` }}
                          />
                          <span>{day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bc-partner-chart__tooltip">$2,450.75</div>
                  </div>
                </section>

                <section className="bc-partner-shell bc-partner-campaigns mt-4">
                  <DashboardWidgetTitle pageClass="bc-partner" title="Active Campaigns" action="See All" />
                  <div className="bc-partner-campaigns__list">
                    {activeCampaigns.map((item) => (
                      <div className="bc-partner-campaigns__row" key={item.title}>
                        <div className="bc-partner-thumb" />
                        <div className="bc-partner-campaigns__copy">
                          <strong>{item.title}</strong>
                          <span>{item.meta}</span>
                        </div>
                        <span>{item.cpc}</span>
                        <span>{item.volume}</span>
                        <strong>{item.gain}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-12 col-xxl-4">
                <section className="bc-partner-shell bc-partner-side-card">
                  <span className="bc-partner-section-label">This Month</span>
                  <h3>$2,450.75</h3>
                  <button type="button" className="bc-partner-gold-btn">Add Funds</button>
                </section>

                <section className="bc-partner-shell bc-partner-side-card mt-4">
                  <DashboardWidgetTitle pageClass="bc-partner" title="Billing Overview" />
                  <div className="bc-partner-billing__summary">
                    <div>
                      <span>Weekly Spend</span>
                      <strong>$26.20</strong>
                    </div>
                    <div>
                      <span>Total Last 7 Days</span>
                      <strong>$26.20</strong>
                    </div>
                  </div>
                </section>

                <section className="bc-partner-shell bc-partner-side-card mt-4">
                  <DashboardWidgetTitle pageClass="bc-partner" title="Quick Actions" />
                  <div className="bc-partner-actions">
                    {quickActions.map((item) => (
                      <button type="button" className="bc-partner-action-btn" key={item.label}>
                        <span><i className={`bi ${item.icon}`} /> {item.label}</span>
                      </button>
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
