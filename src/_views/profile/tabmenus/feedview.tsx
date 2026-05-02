"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

type FeedPost = {
  id: number;
  author: string;
  handle: string;
  postedAt: string;
  content: string;
  likes: number;
  shares: number;
  replies: FeedReply[];
  mine?: boolean;
};

type FeedReply = {
  id: number;
  author: string;
  postedAt: string;
  message: string;
  mine?: boolean;
};

const seededPosts: FeedPost[] = [
  {
    id: 1,
    author: "Alicia Stone",
    handle: "@aliciastone",
    postedAt: "2h ago",
    content:
      "Locked in for the next campaign drop. Just finished shooting a behind-the-scenes reel for everyone in the community.",
    likes: 42,
    shares: 3,
    replies: [
      {
        id: 101,
        author: "Devon Paige",
        postedAt: "45m ago",
        message: "This sounds fire. Can not wait to see the reel.",
      },
      {
        id: 102,
        author: "Lena Brooks",
        postedAt: "30m ago",
        message: "Love this update. Keep the BTS clips coming.",
      },
    ],
  },
  {
    id: 2,
    author: "Marcus Reed",
    handle: "@marcuscreates",
    postedAt: "5h ago",
    content:
      "Question for creators: do you prefer posting short updates daily or one polished post each week?",
    likes: 28,
    shares: 2,
    replies: [
      {
        id: 201,
        author: "Kyrie Moss",
        postedAt: "1h ago",
        message: "I prefer one polished weekly drop, then stories in between.",
      },
    ],
  },
];

function avatarInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default function FeedView() {
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>(seededPosts);
  const [openRepliesPostId, setOpenRepliesPostId] = useState<number | null>(null);
  const [replyDraftByPost, setReplyDraftByPost] = useState<Record<number, string>>({});

  const canPost = draft.trim().length > 0;

  const totalPosts = useMemo(() => posts.length, [posts]);

  function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message) return;

    const newPost: FeedPost = {
      id: Date.now(),
      author: "You",
      handle: "@you",
      postedAt: "Just now",
      content: message,
      likes: 0,
      shares: 0,
      replies: [],
      mine: true,
    };

    setPosts((current) => [newPost, ...current]);
    setDraft("");
  }

  function toggleReplies(postId: number) {
    setOpenRepliesPostId((current) => (current === postId ? null : postId));
  }

  function handleReplyDraftChange(postId: number, value: string) {
    setReplyDraftByPost((current) => ({
      ...current,
      [postId]: value,
    }));
  }

  function handleReplySubmit(event: FormEvent<HTMLFormElement>, postId: number) {
    event.preventDefault();
    const replyText = (replyDraftByPost[postId] ?? "").trim();
    if (!replyText) return;

    const newReply: FeedReply = {
      id: Date.now(),
      author: "You",
      postedAt: "Just now",
      message: replyText,
      mine: true,
    };

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, replies: [...post.replies, newReply] } : post,
      ),
    );

    setReplyDraftByPost((current) => ({
      ...current,
      [postId]: "",
    }));
  }

  return (
    <div className="bc-feed-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-feed-composer">
        <Card.Body>
          <div className="bc-feed-composer__heading">
            <h4 className="mb-1">Create a post</h4>
            <p className="mb-0">Share updates with your audience and followers.</p>
          </div>

          <Form onSubmit={handlePostSubmit}>
            <Form.Group className="mt-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a post..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="bc-feed-composer__input"
              />
            </Form.Group>

            <div className="bc-feed-composer__actions">
              <small>{totalPosts} posts in your feed</small>
              <Button type="submit" className="bc-profile-btn" disabled={!canPost}>
                Post
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {posts.map((post) => (
        <Card className="bc-profile-panel-card bc-feed-post" key={post.id}>
          <Card.Body>
            <div className="bc-feed-post__header">
              <div className="bc-feed-post__identity">
                <span className={`bc-feed-post__avatar ${post.mine ? "is-mine" : ""}`}>
                  {avatarInitials(post.author)}
                </span>
                <div>
                  <h5 className="mb-0">{post.author}</h5>
                  <p className="mb-0">
                    {post.handle} · {post.postedAt}
                  </p>
                </div>
              </div>
              <button className="bc-feed-post__menu" type="button" aria-label="Post options">
                <i className="bi bi-three-dots" />
              </button>
            </div>

            <p className="bc-feed-post__content">{post.content}</p>

            <div className="bc-feed-post__meta">
              <span>
                <i className="bi bi-hand-thumbs-up" /> {post.likes}
              </span>
              <button
                type="button"
                className={`bc-feed-post__meta-btn ${openRepliesPostId === post.id ? "is-open" : ""}`}
                onClick={() => toggleReplies(post.id)}
                aria-expanded={openRepliesPostId === post.id}
                aria-controls={`reply-section-${post.id}`}
              >
                <i className="bi bi-chat-right-text" /> {post.replies.length}
              </button>
              <span>
                <i className="bi bi-send" /> {post.shares}
              </span>
            </div>

            {openRepliesPostId === post.id && (
              <div className="bc-feed-post__replies" id={`reply-section-${post.id}`}>
                <h6>Replies</h6>

                <div className="bc-feed-post__reply-list">
                  {post.replies.length > 0 ? (
                    post.replies.map((reply) => (
                      <article className="bc-feed-post__reply-item" key={reply.id}>
                        <span className={`bc-feed-post__reply-avatar ${reply.mine ? "is-mine" : ""}`}>
                          {avatarInitials(reply.author)}
                        </span>
                        <div className="bc-feed-post__reply-body">
                          <p className="mb-1">
                            <strong>{reply.author}</strong> <span>{reply.postedAt}</span>
                          </p>
                          <p className="mb-0">{reply.message}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="bc-feed-post__reply-empty mb-0">
                      No replies yet. Be the first to respond.
                    </p>
                  )}
                </div>

                <Form onSubmit={(event) => handleReplySubmit(event, post.id)} className="bc-feed-post__reply-form">
                  <Form.Control
                    type="text"
                    placeholder="Write a reply..."
                    value={replyDraftByPost[post.id] ?? ""}
                    onChange={(event) => handleReplyDraftChange(post.id, event.target.value)}
                  />
                  <Button type="submit" className="bc-profile-btn" disabled={!(replyDraftByPost[post.id] ?? "").trim()}>
                    Reply
                  </Button>
                </Form>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}