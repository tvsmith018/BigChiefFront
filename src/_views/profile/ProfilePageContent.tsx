"use client";

import Image from "next/image";
import { Button, Card, Col, Container, Nav, Row } from "react-bootstrap";
import {
  ProfileListCard,
  ProfileMiniInfoCard,
  ProfileRibbonTitle, 
} from "@/_views/account/SharedPanels";

import { ProfileMePayload } from "@/_types/profile/profileMePayload";
const postImage = "/images/about/group.jpeg";

const activityTabs = [{icon: "bi-newspaper", label:"The Feed"}, {icon: "bi-chat-right-dots-fill", label:"Messages", badge:"0"}, {icon: "bi-bell", label:"Notification", badge:"0"},{icon: "bi-eye", label:"Watch History"}, {icon: "bi-graph-up", label:"My Stats"}, {icon: "bi-images", label:"Photos"}, { icon: "bi-gear-fill", label: "Account Settings" },];

const accountCenterItems = [
  { icon: "bi-gear-fill", label: "Creator Account" },
  { icon: "bi-credit-card-2-front-fill", label: "Advertising Account" },
];

export default function ProfilePageContent({ profile }: { profile: ProfileMePayload }) {
    const avatarSrc = profile.user.avatar
      ? profile.user.avatar.replace(/^http:\/\//, "https://")
      : "/images/about/victor.jpg";

    return <main className="bc-profile-page">
        <Container className="pt-0 pb-4 pb-lg-5">
            <Row className="g-4 align-items-stretch bc-profile-scroll-row">
                <Col xl={3} lg={4} className="d-none d-lg-block">
                    <aside className="bc-profile-sidebar"> 
                    <div className="d-grid gap-3">
                        <Card className="bc-profile-panel-card">
                            <Card.Body className="p-3">
                                <div className="bc-profile-side-search">
                                    <span>Hi {profile.user.firstname} {profile.user.lastname}...</span>
                                </div>
                                <div className="bc-profile-side-nav mt-3">
                                    {activityTabs.map((item) => (
                                        item.label != "Notification" && <div className="bc-profile-side-nav__item" key={item.label}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className={`bi ${item.icon}`} />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge ? <span className="bc-profile-side-nav__badge">
                                                {item.badge}
                                            </span>:null}
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                        <ProfileMiniInfoCard
                            icon="bi-bell"
                            title="Notifications"
                            value="Whats his name responded to Comment"
                        />
                        </div>
                    </aside>
                </Col>
                <Col xl={6} lg={8} className="bc-profile-center-scroll">
                <section className="bc-profile-main">
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                </section>
                </Col>
                <Col xl={3} lg={12} className="d-none d-lg-block">
                    <aside className="bc-profile-right">
                        <div className="d-grid gap-3">
                            <Card className="bc-profile-panel-card mt-3">
                                <Card.Body className="text-center">
                                    <div className="bc-profile-avatar mx-auto">
                                        <Image 
                                            src={avatarSrc}
                                            alt={`${profile.user.firstname} ${profile.user.lastname} profile picture`}
                                            width={120}
                                            height={120}
                                            priority
                                        />
                                    </div>
                                    <h3 className="bc-profile-name mt-3">{profile.user.firstname} {profile.user.lastname}</h3>
                                    <p className="bc-profile-status mb-3">The Insider</p>
                                    <Button variant="light" className="bc-profile-btn bc-profile-btn--soft">
                                        <i className="bi bi-pencil-fill me-2" />
                                        {" "}
                                        Edit Profile
                                    </Button>
                                </Card.Body>
                            </Card>
                            <ProfileListCard title="Choose Destiny" items={accountCenterItems} />
                        </div>
                    </aside>
                </Col>
            </Row>
        </Container>
    </main>
}