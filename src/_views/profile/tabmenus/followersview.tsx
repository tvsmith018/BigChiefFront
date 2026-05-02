"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

type FollowStatus = "active" | "muted" | "blocked";

type MockFollower = {
  id: number;
  fullname: string;
  username: string;
  avatarUrl: string;
  status: FollowStatus;
  followedAtLabel: string;
  isFollowingBack: boolean;
};

const mockFollowers: MockFollower[] = [
  {
    id: 1,
    fullname: "Alicia Stone",
    username: "@aliciastone",
    avatarUrl: "/images/about/victor.jpg",
    status: "active",
    followedAtLabel: "2h ago",
    isFollowingBack: true,
  },
  {
    id: 2,
    fullname: "Marcus Reed",
    username: "@marcuscreates",
    avatarUrl: "/images/1x1placeholder.png",
    status: "active",
    followedAtLabel: "Today",
    isFollowingBack: false,
  },
  {
    id: 3,
    fullname: "Lena Brooks",
    username: "@lenab",
    avatarUrl: "/images/1x1placeholder.png",
    status: "muted",
    followedAtLabel: "Yesterday",
    isFollowingBack: true,
  },
  {
    id: 4,
    fullname: "Chris Vale",
    username: "@chrisvale",
    avatarUrl: "/images/1x1placeholder.png",
    status: "active",
    followedAtLabel: "3d ago",
    isFollowingBack: true,
  },
];

export default function FollowersView() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FollowStatus>("all");

  const filteredFollowers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mockFollowers.filter((follower) => {
      const matchesFilter = statusFilter === "all" || follower.status === statusFilter;
      const matchesQuery =
        normalized.length === 0 ||
        follower.fullname.toLowerCase().includes(normalized) ||
        follower.username.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [query, statusFilter]);

  const activeCount = useMemo(
    () => mockFollowers.filter((follower) => follower.status === "active").length,
    [],
  );

  return (
    <div className="bc-followers-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-followers-header">
        <Card.Body>
          <div className="bc-followers-header__top">
            <div>
              <h4 className="mb-1">Followers</h4>
              <p className="mb-0">Preview follower relationships from the ProfileFollow model flow.</p>
            </div>
            <span className="bc-followers-header__badge">
              {activeCount}/{mockFollowers.length} active
            </span>
          </div>

          <div className="bc-followers-header__filters">
            <Form.Control
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search followers..."
            />
            <Form.Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | FollowStatus)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="muted">Muted</option>
              <option value="blocked">Blocked</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      <Card className="bc-profile-panel-card bc-followers-list-card">
        <Card.Body>
          <div className="bc-followers-list">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower) => (
                <article className="bc-followers-item" key={follower.id}>
                  <div className="bc-followers-item__identity">
                    <span className="bc-followers-item__avatar">
                      <Image src={follower.avatarUrl} alt={`${follower.fullname} avatar`} width={48} height={48} />
                    </span>
                    <div>
                      <h6 className="mb-0">{follower.fullname}</h6>
                      <p className="mb-0">
                        {follower.username} · {follower.followedAtLabel}
                      </p>
                    </div>
                  </div>

                  <div className="bc-followers-item__actions">
                    <span className={`bc-followers-pill is-${follower.status}`}>{follower.status}</span>
                    <Button type="button" className="bc-profile-btn bc-followers-item__btn">
                      {follower.isFollowingBack ? "Following back" : "Follow back"}
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <p className="bc-followers-list__empty mb-0">No followers match your current filters.</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}