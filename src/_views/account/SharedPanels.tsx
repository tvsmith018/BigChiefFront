import type { ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface SharedNavItem {
  icon: string;
  label: string;
  active?: boolean;
  badge?: string;
}

export interface SharedListItem {
  icon: string;
  label: string;
}

export function DashboardSidebar({
  pageClass,
  brand,
  items,
  footer,
}: Readonly<{
  pageClass: string;
  brand: string;
  items: SharedNavItem[];
  footer?: ReactNode;
}>) {
  return (
    <div className={`${pageClass}-shell ${pageClass}-shell--dark`}>
      <div className={`${pageClass}-brand`}>{brand}</div>
      <nav className={`${pageClass}-nav`}>
        {items.map((item) => (
          <button
            type="button"
            className={cx(`${pageClass}-nav__item`, item.active && "is-active")}
            key={item.label}
          >
            <span>
              <i className={`bi ${item.icon}`} /> {item.label}
            </span>
            {item.badge ? <em>{item.badge}</em> : null}
          </button>
        ))}
      </nav>
      {footer ? <div className={`${pageClass}-sidebar-footer`}>{footer}</div> : null}
    </div>
  );
}

export function DashboardWidgetTitle({
  pageClass,
  title,
  action,
}: Readonly<{
  pageClass: string;
  title: string;
  action?: string;
}>) {
  return (
    <div className={`${pageClass}-widget-title`}>
      <h3>{title}</h3>
      {action ? (
        <button type="button">
          {action} <i className="bi bi-chevron-right" />
        </button>
      ) : null}
    </div>
  );
}

export function DashboardTabs({
  pageClass,
  tabs,
}: Readonly<{
  pageClass: string;
  tabs: Array<{ label: string; active?: boolean }>;
}>) {
  return (
    <section className={`${pageClass}-tabs ${pageClass}-shell`}>
      {tabs.map((tab) => (
        <button
          type="button"
          className={tab.active ? "is-active" : undefined}
          key={tab.label}
        >
          {tab.label}
        </button>
      ))}
    </section>
  );
}

export function DashboardMetricCard({
  pageClass,
  label,
  value,
  delta,
  className,
}: Readonly<{
  pageClass: string;
  label: string;
  value: string;
  delta?: string;
  className?: string;
}>) {
  return (
    <div className={cx(`${pageClass}-shell`, `${pageClass}-stat-card`, className)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {delta ? <small>{delta}</small> : null}
    </div>
  );
}

export function DashboardActionCard({
  pageClass,
  icon,
  label,
  sublabel,
}: Readonly<{
  pageClass: string;
  icon: string;
  label: string;
  sublabel?: string;
}>) {
  return (
    <button type="button" className={`${pageClass}-tool-card`}>
      <i className={`bi ${icon}`} />
      <strong>{label}</strong>
      {sublabel ? <span>{sublabel}</span> : null}
    </button>
  );
}

export function ProfileRibbonTitle({
  title,
  variant = "primary",
}: Readonly<{
  title: string;
  variant?: "primary" | "danger";
}>) {
  return (
    <div
      className={`bc-profile-ribbon ${
        variant === "danger" ? "bc-profile-ribbon--danger" : ""
      }`}
    >
      <span>{title}</span>
    </div>
  );
}

export function ProfileMiniInfoCard({
  icon,
  title,
  value,
}: Readonly<{
  icon: string;
  title: string;
  value: string;
}>) {
  return (
    <div className="card bc-profile-mini-card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${icon} bc-profile-mini-card__icon`} />
            <span className="bc-profile-mini-card__title">{title}</span>
          </div>
          <i className="bi bi-chevron-right bc-profile-mini-card__chevron" />
        </div>
        <div className="bc-profile-mini-card__value">{value}</div>
      </div>
    </div>
  );
}

export function ProfileListCard({
  title,
  items,
}: Readonly<{
  title: string;
  items: SharedListItem[];
}>) {
  return (
    <div className="card bc-profile-panel-card">
      <div className="card-body p-0">
        <ProfileRibbonTitle title={title} />
        <div className="bc-profile-list">
          {items.map((item) => (
            <div className="bc-profile-list__item" key={item.label}>
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </div>
              <i className="bi bi-chevron-right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
