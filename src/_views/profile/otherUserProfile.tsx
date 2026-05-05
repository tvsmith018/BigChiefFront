"use client"

import type { ProfileViewPayloadOther } from "@/_types/profile/profileViewPayload";
import { Button, Card, Col, Container, Nav, Row } from "react-bootstrap";
import Image from "next/image";
import { useState } from "react";
import { PROFILE_AVATAR_PLACEHOLDER } from "@/_constants/profilePlaceholders";
import FeedView from "./tabmenus/feedview";
import PhotoView from "./tabmenus/photosview";
import FollowersView from "./tabmenus/followersview";

type ProfileTab = "Posts" | "Photos" | "Followers"
const activityTabs = [{icon: "bi-newspaper", label:"Posts", tab:"Posts"}, {icon: "bi bi-person-arms-up", label:"Followers", badge:"0", tab:"Followers"}, {icon: "bi-images", label:"Photos", tab:"Photos"},];

export default function OtherUserProfile({ profile }: Readonly<{ profile: ProfileViewPayloadOther }>) {
    const [tab, setTab] = useState<ProfileTab>("Posts");
    const avatarSrc = profile.user.avatarUrl ?? PROFILE_AVATAR_PLACEHOLDER;

    return <main className="bc-profile-page">
        <Container className="pt-0 pb-4 pb-lg-5">
            <Row className="g-4 align-items-stretch bc-profile-scroll-row">
                <Col xl={3} lg={4} className="d-none d-lg-block">
                    <aside className="bc-profile-sidebar">
                        <div className="d-none d-lg-grid d-xl-none gap-3">
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
                                        <i className="bi bi-chat-right-dots-fill me-2" />
                                        {" "}
                                        Message Me
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="d-grid gap-3 mt-3">
                            <Card className="bc-profile-panel-card">
                                <Card.Body className="p-3">
                                    <div className="bc-profile-side-nav mt-3">
                                        {activityTabs.map((item) => (
                                            item.label != "Notification" && (
                                                <button
                                                    type="button"
                                                    key={item.label}
                                                    className={`bc-profile-side-nav__item ${tab === item.tab ? "active-lg" : ""}`}
                                                    onClick={() => setTab(item.tab as ProfileTab)}
                                                    aria-current={tab === item.tab ? "true" : undefined}
                                                >
                                                    <span className="d-flex align-items-center gap-2">
                                                        <i className={`bi ${item.icon}`} aria-hidden />
                                                        <span>{item.label}</span>
                                                    </span>
                                                    {item.badge ? (
                                                        <span className="bc-profile-side-nav__badge">{item.badge}</span>
                                                    ) : null}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </aside>
                </Col>
                <Col xl={6} lg={8} className="bc-profile-center-scroll">
                    <section className="bc-profile-main">
                    <Card className="bc-profile-feed-card mt-3 d-lg-none">
                        <Card.Body className="p-0">
                            <div className="p-2">
                                <Nav className="bc-profile-tabs" variant="tabs">
                                {activityTabs.map((tabname) => (
                                    <Nav.Item key={tabname.label}>
                                        <Nav.Link active={tabname.tab === tab} onClick={()=>setTab(tabname.tab as ProfileTab)}>
                                            <i className={`bi ${tabname.icon} me-2`} />
                                            {tabname.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                                </Nav>
                            </div>
                        </Card.Body>
                    </Card>
                    
                    <div>
                        {tab == "Posts" && <FeedView />}
                        {tab == "Photos" && <PhotoView />}
                        {tab == "Followers" && <FollowersView />}
                    </div>
                    </section>
                </Col>
                <Col xl={3} lg={12} className="d-none d-xl-block">
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
                                        <i className="bi bi-chat-right-dots-fill me-2" />
                                        {" "}
                                        Message Me
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </aside>
                </Col>
            </Row>
        </Container>
    </main>
}