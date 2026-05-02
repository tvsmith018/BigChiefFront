"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

type ThreadType = "direct" | "group" | "system";
type ThreadStatus = "active" | "archived" | "closed";
type MessageType = "text" | "image" | "file" | "system";
type MessageStatus = "sent" | "edited" | "deleted";

type MessageItem = {
  id: number;
  senderName: string;
  body: string;
  createdAtLabel: string;
  messageType: MessageType;
  status: MessageStatus;
  mine?: boolean;
};

type MessageThreadView = {
  id: number;
  threadType: ThreadType;
  status: ThreadStatus;
  subject: string;
  participantLabel: string;
  participantAvatar: string;
  lastMessageAtLabel: string;
  unreadCount: number;
  messages: MessageItem[];
};

const initialThreads: MessageThreadView[] = [
  {
    id: 101,
    threadType: "direct",
    status: "active",
    subject: "",
    participantLabel: "Alicia Stone",
    participantAvatar: "AS",
    lastMessageAtLabel: "2m ago",
    unreadCount: 2,
    messages: [
      {
        id: 1,
        senderName: "Alicia Stone",
        body: "Can you review the latest drop concept tonight?",
        createdAtLabel: "12:08 PM",
        messageType: "text",
        status: "sent",
      },
      {
        id: 2,
        senderName: "You",
        body: "Yes, send me the files and I got you.",
        createdAtLabel: "12:10 PM",
        messageType: "text",
        status: "sent",
        mine: true,
      },
      {
        id: 3,
        senderName: "Alicia Stone",
        body: "Perfect. Sending now.",
        createdAtLabel: "12:11 PM",
        messageType: "text",
        status: "sent",
      },
    ],
  },
  {
    id: 102,
    threadType: "group",
    status: "active",
    subject: "Campaign Team",
    participantLabel: "Campaign Team",
    participantAvatar: "CT",
    lastMessageAtLabel: "20m ago",
    unreadCount: 0,
    messages: [
      {
        id: 4,
        senderName: "Marcus Reed",
        body: "Group check-in tomorrow at 9AM.",
        createdAtLabel: "11:46 AM",
        messageType: "text",
        status: "sent",
      },
      {
        id: 5,
        senderName: "You",
        body: "Confirmed. I will be there.",
        createdAtLabel: "11:48 AM",
        messageType: "text",
        status: "sent",
        mine: true,
      },
    ],
  },
  {
    id: 103,
    threadType: "system",
    status: "active",
    subject: "System Alerts",
    participantLabel: "System Alerts",
    participantAvatar: "SA",
    lastMessageAtLabel: "1d ago",
    unreadCount: 1,
    messages: [
      {
        id: 6,
        senderName: "System",
        body: "Your account security settings were updated successfully.",
        createdAtLabel: "Yesterday",
        messageType: "system",
        status: "sent",
      },
    ],
  },
];

export default function MessageView() {
  const [threads, setThreads] = useState<MessageThreadView[]>(initialThreads);
  const [searchText, setSearchText] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [composer, setComposer] = useState("");

  const filteredThreads = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => {
      return (
        thread.participantLabel.toLowerCase().includes(query) ||
        thread.subject.toLowerCase().includes(query) ||
        thread.messages.some((message) => message.body.toLowerCase().includes(query))
      );
    });
  }, [searchText, threads]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  const unreadTotal = useMemo(
    () => threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [threads],
  );

  const openThread = (threadId: number) => {
    setActiveThreadId(threadId);
    setThreads((current) =>
      current.map((thread) => (thread.id === threadId ? { ...thread, unreadCount: 0 } : thread)),
    );
  };

  const closeThread = () => {
    setActiveThreadId(null);
    setComposer("");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = composer.trim();
    if (!body || !activeThreadId) return;

    setThreads((current) =>
      current.map((thread) => {
        if (thread.id !== activeThreadId) return thread;
        return {
          ...thread,
          lastMessageAtLabel: "Just now",
          messages: [
            ...thread.messages,
            {
              id: Date.now(),
              senderName: "You",
              body,
              createdAtLabel: "Now",
              messageType: "text",
              status: "sent",
              mine: true,
            },
          ],
        };
      }),
    );

    setComposer("");
  };

  return (
    <div className="bc-message-view mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-message-shell">
        <Card.Body className="p-0">
          <div className="bc-message-shell__header">
            <div>
              <h4 className="mb-0">Messages</h4>
              <p className="mb-0">Stay connected with your community.</p>
            </div>
            <span className="bc-message-shell__unread">{unreadTotal} unread</span>
          </div>

          <div className="bc-message-search">
            <i className="bi bi-search" />
            <Form.Control
              type="text"
              placeholder="Search conversations..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="bc-message-list">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => {
                const lastMessage = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.id}
                    type="button"
                    className="bc-message-item"
                    onClick={() => openThread(thread.id)}
                  >
                    <span className={`bc-message-item__avatar ${thread.threadType === "group" ? "is-group" : ""}`}>
                      {thread.participantAvatar}
                    </span>

                    <span className="bc-message-item__content">
                      <span className="bc-message-item__top">
                        <strong>{thread.participantLabel}</strong>
                        <small>{thread.lastMessageAtLabel}</small>
                      </span>
                      <span className="bc-message-item__preview">{lastMessage?.body ?? "No messages yet."}</span>
                    </span>

                    {thread.unreadCount > 0 ? (
                      <span className="bc-message-item__badge">{thread.unreadCount}</span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="bc-message-list__empty mb-0">No conversations matched your search.</p>
            )}
          </div>
        </Card.Body>
      </Card>

      <div className={`bc-message-thread-panel ${activeThread ? "is-open" : ""}`}>
        {activeThread ? (
          <Card className="bc-profile-panel-card bc-message-thread-card">
            <Card.Body className="p-0 d-flex flex-column">
              <div className="bc-message-thread__topbar">
                <button type="button" className="bc-message-thread__back" onClick={closeThread}>
                  <i className="bi bi-arrow-left" />
                </button>
                <div className="bc-message-thread__title">
                  <h5 className="mb-0">{activeThread.participantLabel}</h5>
                  <small>
                    {activeThread.threadType} · {activeThread.status}
                  </small>
                </div>
                <button type="button" className="bc-message-thread__action">
                  <i className="bi bi-three-dots" />
                </button>
              </div>

              <div className="bc-message-thread__messages">
                {activeThread.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`bc-message-bubble ${message.mine ? "is-mine" : ""} ${
                      message.messageType === "system" ? "is-system" : ""
                    }`}
                  >
                    <p className="mb-1">{message.body}</p>
                    <span>
                      {message.createdAtLabel}
                      {message.mine ? ` · ${message.status}` : ""}
                    </span>
                  </article>
                ))}
              </div>

              <Form onSubmit={sendMessage} className="bc-message-thread__composer">
                <Form.Control
                  type="text"
                  placeholder="Write a message..."
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                />
                <Button type="submit" className="bc-profile-btn" disabled={!composer.trim()}>
                  Send
                </Button>
              </Form>
            </Card.Body>
          </Card>
        ) : null}
      </div>
    </div>
  );
 }