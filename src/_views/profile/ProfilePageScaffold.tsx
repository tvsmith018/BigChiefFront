"use client";

import Image from "next/image";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Card, Col, Container, Nav, Row } from "react-bootstrap";

export type ProfileActivityTabItem<T extends string = string> = {
  icon: string;
  label: string;
  tab: T;
  badge?: string;
};

type ProfileThreeColumnLayoutProps<T extends string> = {
  firstName: string;
  lastName: string;
  avatarSrc: string;
  primaryAction: ReactNode;
  activityTabs: ProfileActivityTabItem<T>[];
  tab: T;
  setTab: Dispatch<SetStateAction<T>>;
  /** Optional block above the sidebar tab list (e.g. greeting). */
  sidebarNavPrefix?: ReactNode;
  /** Optional content after the sidebar nav card (e.g. notifications mini card). */
  sidebarAfterNav?: ReactNode;
  /** Optional extra block in the right column under the avatar card. */
  rightAsideExtra?: ReactNode;
  children: ReactNode;
};

function ProfileAvatarCard({
  avatarSrc,
  firstName,
  lastName,
  children,
}: Readonly<{
  avatarSrc: string;
  firstName: string;
  lastName: string;
  children: ReactNode;
}>) {
  return (
    <Card className="bc-profile-panel-card mt-3">
      <Card.Body className="text-center">
        <div className="bc-profile-avatar mx-auto">
          <Image
            src={avatarSrc}
            alt={`${firstName} ${lastName} profile picture`}
            width={120}
            height={120}
            priority
          />
        </div>
        <h3 className="bc-profile-name mt-3">
          {firstName} {lastName}
        </h3>
        <p className="bc-profile-status mb-3">The Insider</p>
        {children}
      </Card.Body>
    </Card>
  );
}

function ProfileSidebarNavCard<T extends string>({
  activityTabs,
  tab,
  setTab,
  sidebarNavPrefix,
}: Readonly<{
  activityTabs: ProfileActivityTabItem<T>[];
  tab: T;
  setTab: Dispatch<SetStateAction<T>>;
  sidebarNavPrefix?: ReactNode;
}>) {
  return (
    <Card className="bc-profile-panel-card">
      <Card.Body className="p-3">
        {sidebarNavPrefix}
        <div className="bc-profile-side-nav mt-3">
          {activityTabs.map((item) =>
            item.label !== "Notification" ? (
              <button
                type="button"
                key={item.label}
                className={`bc-profile-side-nav__item ${tab === item.tab ? "active-lg" : ""}`}
                onClick={() => setTab(item.tab)}
                aria-current={tab === item.tab ? "true" : undefined}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className={`bi ${item.icon}`} aria-hidden />
                  <span>{item.label}</span>
                </span>
                {item.badge ? <span className="bc-profile-side-nav__badge">{item.badge}</span> : null}
              </button>
            ) : null,
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function ProfileMobileTabNav<T extends string>({
  activityTabs,
  tab,
  setTab,
}: Readonly<{
  activityTabs: ProfileActivityTabItem<T>[];
  tab: T;
  setTab: Dispatch<SetStateAction<T>>;
}>) {
  return (
    <Card className="bc-profile-feed-card mt-3 d-lg-none">
      <Card.Body className="p-0">
        <div className="p-2">
          <Nav className="bc-profile-tabs" variant="tabs">
            {activityTabs.map((tabname) => (
              <Nav.Item key={tabname.label}>
                <Nav.Link active={tabname.tab === tab} onClick={() => setTab(tabname.tab)}>
                  <i className={`bi ${tabname.icon} me-2`} />
                  {tabname.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Shared three-column profile shell (sidebar / main / right aside) used by
 * {@link ProfilePageContent} and {@link OtherUserProfile}.
 */
export function ProfileThreeColumnLayout<T extends string>({
  firstName,
  lastName,
  avatarSrc,
  primaryAction,
  activityTabs,
  tab,
  setTab,
  sidebarNavPrefix,
  sidebarAfterNav,
  rightAsideExtra,
  children,
}: Readonly<ProfileThreeColumnLayoutProps<T>>) {
  return (
    <main className="bc-profile-page">
      <Container className="pt-0 pb-4 pb-lg-5">
        <Row className="g-4 align-items-stretch bc-profile-scroll-row">
          <Col xl={3} lg={4} className="d-none d-lg-block">
            <aside className="bc-profile-sidebar">
              <div className="d-none d-lg-grid d-xl-none gap-3">
                <ProfileAvatarCard avatarSrc={avatarSrc} firstName={firstName} lastName={lastName}>
                  {primaryAction}
                </ProfileAvatarCard>
              </div>
              <div className="d-grid gap-3 mt-3">
                <ProfileSidebarNavCard
                  activityTabs={activityTabs}
                  tab={tab}
                  setTab={setTab}
                  sidebarNavPrefix={sidebarNavPrefix}
                />
                {sidebarAfterNav}
              </div>
            </aside>
          </Col>
          <Col xl={6} lg={8} className="bc-profile-center-scroll">
            <section className="bc-profile-main">
              <ProfileMobileTabNav activityTabs={activityTabs} tab={tab} setTab={setTab} />
              <div>{children}</div>
            </section>
          </Col>
          <Col xl={3} lg={12} className="d-none d-xl-block">
            <aside className="bc-profile-right">
              <div className="d-grid gap-3">
                <ProfileAvatarCard avatarSrc={avatarSrc} firstName={firstName} lastName={lastName}>
                  {primaryAction}
                </ProfileAvatarCard>
                {rightAsideExtra}
              </div>
            </aside>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
