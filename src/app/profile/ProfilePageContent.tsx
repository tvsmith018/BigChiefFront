"use client";

import Image from "next/image";
import { Button, Card, Col, Container, Nav, Row } from "react-bootstrap";
import {
  ProfileListCard,
  ProfileMiniInfoCard,
  ProfileRibbonTitle, 
} from "@/_components/account/SharedPanels";

const avatarImage = "/images/about/victor.jpg";
const postImage = "/images/about/group.jpeg";

const sideNavItems = [
  { icon: "bi-house-door-fill", label: "Feed" },
  { icon: "bi-bell-fill", label: "Notifications", badge: "1" },
  { icon: "bi-chat-left-text-fill", label: "Messages", badge: "1" },
  { icon: "bi-collection-play-fill", label: "My Content" },
  { icon: "bi-bookmark-heart-fill", label: "Saved Articles" },
];

const activityTabs = ["My Posts", "Watch History", "My Ratings", "Photos"];

const accountCenterItems = [
  { icon: "bi-gear-fill", label: "Account Settings" },
  { icon: "bi-credit-card-2-front-fill", label: "Subscription & Billing" },
];

export default function ProfilePageContent() {
  return (
    <main className="bc-profile-page">
      <Container className="pt-0 pb-4 pb-lg-5">
        <Row className="g-4 align-items-start">
          <Col xl={3} lg={4} className="d-none d-lg-block">
            <aside className="bc-profile-sidebar">
              <Card className="bc-profile-panel-card">
                <Card.Body className="p-3">
                  <div className="bc-profile-side-search">
                    <i className="bi bi-search" />
                    <span>Search...</span>
                  </div>

                  <div className="bc-profile-side-nav mt-3">
                    {sideNavItems.map((item) => (
                      <div className="bc-profile-side-nav__item" key={item.label}>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${item.icon}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="bc-profile-side-nav__badge">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card className="bc-profile-panel-card mt-3">
                <Card.Body className="text-center">
                  <div className="bc-profile-avatar mx-auto">
                    <Image
                      src={avatarImage}
                      alt="Terrance V. Smith"
                      width={120}
                      height={120}
                    />
                  </div>
                  <h3 className="bc-profile-name mt-3">Terrance V. Smith</h3>
                  <p className="bc-profile-status mb-3">Standard Member</p>
                  <div className="d-grid gap-2">
                    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
                      <i className="bi bi-chat-fill me-2" />
                      Message
                    </Button>
                    <Button className="bc-profile-btn">
                      <i className="bi bi-pencil-fill me-2" />
                      Edit Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </aside>
          </Col>

          <Col xl={6} lg={8}>
            <section className="bc-profile-main">
              <Card className="bc-profile-panel-card bc-profile-hero-card d-none d-lg-block">
                <Card.Body className="text-center">
                  <div className="bc-profile-avatar bc-profile-avatar--hero mx-auto">
                    <Image
                      src={avatarImage}
                      alt="Terrance V. Smith"
                      width={140}
                      height={140}
                    />
                  </div>
                  <h1 className="bc-profile-name bc-profile-name--hero mt-3">
                    Terrance V. Smith
                  </h1>
                  <p className="bc-profile-status">Standard Member</p>

                  <div className="bc-profile-hero-actions">
                    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
                      <i className="bi bi-chat-fill me-2" />
                      Message
                    </Button>
                    <Button className="bc-profile-btn">
                      <i className="bi bi-pencil-fill me-2" />
                      Edit Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card className="bc-profile-panel-card bc-profile-hero-card d-lg-none">
                <Card.Body className="text-center">
                  <div className="bc-profile-avatar bc-profile-avatar--mobile mx-auto">
                    <Image
                      src={avatarImage}
                      alt="Terrance V. Smith"
                      width={120}
                      height={120}
                    />
                  </div>
                  <h2 className="bc-profile-name mt-3">Terrance V. Smith</h2>
                  <p className="bc-profile-status">Standard Member</p>

                  <div className="bc-profile-hero-actions">
                    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
                      <i className="bi bi-chat-fill me-2" />
                      Message
                    </Button>
                    <Button className="bc-profile-btn">
                      <i className="bi bi-pencil-fill me-2" />
                      Edit Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Card className="bc-profile-option-card">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-camera-fill" />
                        <span>Content Creator Account</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="bc-profile-option-card">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-megaphone-fill" />
                        <span>Advertising Account</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="bc-profile-panel-card mt-3">
                <Card.Body className="p-0">
                  <ProfileRibbonTitle title="Profile Snapshot" />
                  <Row className="g-0 bc-profile-stats-row">
                    <Col xs={4}>
                      <div className="bc-profile-stat">
                        <span className="bc-profile-stat__label">Posts</span>
                        <span className="bc-profile-stat__value">128</span>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="bc-profile-stat bc-profile-stat--middle">
                        <span className="bc-profile-stat__label">Followers</span>
                        <span className="bc-profile-stat__value">4,560</span>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="bc-profile-stat">
                        <span className="bc-profile-stat__label">Earnings</span>
                        <span className="bc-profile-stat__value">$2,300</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="bc-profile-panel-card mt-3">
                <Card.Body className="p-0">
                  <ProfileRibbonTitle title="Activity Hub" />
                  <div className="p-3">
                    <Nav className="bc-profile-tabs" variant="tabs">
                      {activityTabs.map((tab, index) => (
                        <Nav.Item key={tab}>
                          <Nav.Link active={index === 0}>{tab}</Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>

                    <Card className="bc-profile-feed-card mt-3">
                      <Card.Body>
                        <Row className="g-3 align-items-center">
                          <Col xs={4} sm={3}>
                            <div className="bc-profile-feed-card__image">
                              <Image
                                src={postImage}
                                alt="Breaking News: Local Events Recap"
                                width={240}
                                height={150}
                              />
                            </div>
                          </Col>
                          <Col xs={8} sm={9}>
                            <div className="d-flex align-items-start justify-content-between gap-3">
                              <div>
                                <h4 className="bc-profile-feed-card__title">
                                  Breaking News: Local Events Recap
                                </h4>
                                <p className="bc-profile-feed-card__meta">
                                  2.3k Views - 5 Comments
                                </p>
                              </div>
                              <i className="bi bi-chevron-right bc-profile-feed-card__arrow" />
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>
                </Card.Body>
              </Card>
            </section>
          </Col>

          <Col xl={3} lg={12}>
            <aside className="bc-profile-right">
              <div className="d-grid gap-3">
                <ProfileMiniInfoCard
                  icon="bi-clock-history"
                  title="Watch History"
                  value="Recently Watched: 5 Videos"
                />
                <ProfileMiniInfoCard
                  icon="bi-star-fill"
                  title="My Ratings"
                  value="Rated Articles: 37"
                />
                <ProfileListCard title="Account Center" items={accountCenterItems} />
                <Card className="bc-profile-panel-card">
                  <Card.Body className="p-0">
                    <ProfileRibbonTitle title="Danger Zone" variant="danger" />
                    <div className="p-3 d-grid gap-2">
                      <Button className="bc-profile-btn bc-profile-btn--danger">
                        Disable Account
                      </Button>
                      <Button className="bc-profile-btn bc-profile-btn--danger">
                        Delete Account
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </aside>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
