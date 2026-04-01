"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Link from "next/link";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import { RelativeTime } from "@/_core/date/RelativeTime";
import { useArticleComments } from "@/_utilities/hooks/article/useArticleComments";
import {
  useInfiniteObserver,
  usePaginatedCollection,
  relatedPaginationAdapter
} from "@/_core/pagination";

type DetailTab = "comment" | "stat" | "author" | "related" | "article";

interface Author {
    firstname:string,
    lastname:string,
    avatarUrl:string,
    bio:string,
    dob:string
}

interface RelatedArticle{
    node: {
        image4x3Url?: string,
        altImage?: string,
        badgeColor: string,
        category: string,
        id: string,
        title:string,
        author: {
            firstname: string,
            lastname: string,
            avatarUrl?: string
        },
        created: string
    }
}

interface ArticleComment{
    node: {
        user: {
            firstname:string,
            lastname:string,
            avatarUrl?:string
        },
        body:string,
        created:string
    }
}

interface PageInfo{
    hasNextPage: boolean,
    endCursor: string
}

interface Props {
  briefsummary: string;
  author: {
    firstname: string;
    lastname: string;
    avatarUrl?: string;
    bio?: string;
    dob?: string;
  };
  body: string;
  related: RelatedArticle[];
  category: string;
  articleId: string;
  comments: ArticleComment[];
  relatedPageInfo: PageInfo
  commentsPageInfo:PageInfo
}

export default function ArticleDetailSidebar({
  briefsummary,
  author,
  body,
  related,
  articleId,
  comments,
  category,
  relatedPageInfo,
  commentsPageInfo
}: Props) {
    const [articleCollapse, setArticleCollapse] = useState("....Read More");
    const [tab, setTab] = useState<DetailTab>("comment");
    const [tabButtonStyle, setTabButtonStyle] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    items: relatedArticlesList,
    isLoading: isLoadingRelated,
    hasMore: hasMoreRelated,
    error: relatedError,
    loadMore: loadMoreRelated,
    retry: retryRelated,
  } = usePaginatedCollection<
    RelatedArticle,
    string,
    { category: string; articleId: string }
  >({
    initialItems: related,
    initialCursor: relatedPageInfo.endCursor,
    initialHasMore: relatedPageInfo.hasNextPage,
    adapter: relatedPaginationAdapter,
    params: { category, articleId },
    resetKey: `${category}-${articleId}`,
    dedupe: true,
    getItemId: (item) => item.node.id,
  });

  const { sentinelRef: relatedSentinelRef } = useInfiniteObserver({
    enabled: tab === "related",
    hasMore: hasMoreRelated,
    isLoading: isLoadingRelated,
    onIntersect: loadMoreRelated,
    rootMargin: "300px 0px",
    threshold: 0,
  });

  const {
    commentState,
    socketError,
    submitComment,
    commentsSentinelRef,
    hasMoreComments,
    isLoadingComments,
    commentsError,
    retryComments,
  } = useArticleComments({
    articleId,
    initialComments: comments,
    pageInfo: commentsPageInfo,
    scrollRootRef: commentsScrollRef,
  });

  const briefStyle = useMemo(
    () => ({
      backgroundColor: "rgba(255, 193, 7, 0.2)",
      border: "solid",
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 10,
    }),
    []
  );

  const toggleArticleCollapse = () => {
    setArticleCollapse((prev) =>
      prev === "....Read More" ? "....Read Less" : "....Read More"
    );
  };

  useEffect(() => {
    const handleResize = () => {
      setTabButtonStyle(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderTooltip = useCallback(
    (label: string) => (props: any) =>
      (
        <Tooltip id={`tooltip-${label}`} {...props}>
          {label}
        </Tooltip>
      ),
    []
  );

  return (
    <Col className="containerDesktop">
      <div className="px-3 pt-1" style={tabButtonStyle ? briefStyle : undefined}>
        <p className="fw-semibold d-lg-none">{briefsummary}</p>

        <Nav
          variant="underline"
          className="justify-content-center pb-2 my-custom-tabs"
          defaultActiveKey="comment"
        >
          <Nav.Item className="d-lg-none">
            <Nav.Link eventKey="comment" onClick={() => setTab("comment")}>
              <OverlayTrigger placement="right" overlay={renderTooltip("Comments")}>
                <i className="bi bi-chat-left-text-fill fs-2"></i>
              </OverlayTrigger>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-lg-none">
            <Nav.Link eventKey="stat" onClick={() => setTab("stat")}>
              <OverlayTrigger placement="right" overlay={renderTooltip("More Details")}>
                <i className="bi bi-graph-up fs-2"></i>
              </OverlayTrigger>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-lg-none">
            <Nav.Link eventKey="author" onClick={() => setTab("author")}>
              <OverlayTrigger placement="right" overlay={renderTooltip("Author")}>
                <i className="bi bi-person-vcard fs-2"></i>
              </OverlayTrigger>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-lg-none">
            <Nav.Link eventKey="related" onClick={() => setTab("related")}>
              <OverlayTrigger placement="right" overlay={renderTooltip("Related")}>
                <i className="bi bi-camera-video-fill fs-2"></i>
              </OverlayTrigger>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-none d-lg-block">
            <Nav.Link eventKey="article" onClick={() => setTab("article")}>
              Article
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-none d-lg-block">
            <Nav.Link eventKey="author" onClick={() => setTab("author")}>
              Author
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-none d-lg-block">
            <Nav.Link eventKey="related" onClick={() => setTab("related")}>
              Related
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="d-none d-lg-block">
            <Nav.Link eventKey="comment" onClick={() => setTab("comment")}>
              Comments
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {tab === "author" && (
        <div className="mt-3">
          {author.avatarUrl ? (
            <Image
              className="rounded-circle d-block mx-auto"
              src={author.avatarUrl}
              alt={`Image of ${author.firstname} ${author.lastname}`}
              width={150}
              height={150}
            />
          ) : null}
          <p className="mt-3">{author.bio}</p>
        </div>
      )}

      {tab === "stat" && (
        <div className="mt-3">
          <div className="d-flex justify-content-around fs-6">
            <div className="text-center mt-2">
              <i className="bi bi-eye-fill"></i>
              <div>N/A Views</div>
            </div>
            <div className="vr" style={{ height: 80, width: 2, backgroundColor: "black", opacity: 1 }}></div>
            <div className="text-center mt-2">
              <i className="bi bi-star-fill"></i>
              <div>N/A Stars</div>
            </div>
            <div className="vr" style={{ height: 80, width: 2, backgroundColor: "black", opacity: 1 }}></div>
            <div className="text-center mt-2">
              <i className="bi bi-arrow-right"></i>
              <div>Neutral</div>
            </div>
          </div>

          <div
            className="border rounded px-3 pt-1 mt-3 mb-1"
            style={{ backgroundColor: "rgba(136, 105, 12, 0.2)" }}
          >
            <p>
              {articleCollapse === "....Read More" ? body.substring(0, 200) : body}
              &nbsp;&nbsp;
              <span onClick={toggleArticleCollapse}>
                <strong>{articleCollapse}</strong>
              </span>
            </p>
          </div>
        </div>
      )}

      {tab === "related" && (
        <>
        <div className="mt-3">
          <Row className="g-4 mb-2">
            {relatedArticlesList.length === 0 && <div>Nothing here yet, we have more soon.</div>}

            {relatedArticlesList.map((articleNode, index) => {
              const article = articleNode.node;

              return (
                <Col xs={12} key={article.id ?? index}>
                  <Card>
                    <Row className="g-0">
                      <Col xs={12}>
                        <div className="ratio ratio-16x9">
                          <Image
                            src={article.image4x3Url ?? "/images/4x3placeholder.png"}
                            alt={article.altImage ?? ""}
                            className="card-img"
                            loading="eager"
                            width={1000}
                            height={750}
                            placeholder="blur"
                            blurDataURL="/images/4x3placeholder.png"
                            quality={75}
                          />
                        </div>
                      </Col>

                      <Col className="mt-2">
                        <a className={`badge ${article.badgeColor} mb-2`}>
                          <i className="bi bi-record-fill me-1"></i>
                          {article.category}
                        </a>

                        <h5>
                          <Link
                            href={`/articles/details/${article.id}`}
                            className="btn-link stretched-link text-reset fw-bold"
                          >
                            {article.title}
                          </Link>
                        </h5>

                        <Nav as="ul" className="nav-divider align-items-center fs-6 small">
                          <Nav.Item as="li">
                            <Nav.Link as="div">
                              <div className="d-flex align-items-center position-relative">
                                <div className="avatar avatar-sm">
                                  <Image
                                    src={article.author?.avatarUrl ?? "/images/1x1placeholder.png"}
                                    alt={`Picture of ${article.author?.firstname} ${article.author?.lastname}`}
                                    className="avatar-img rounded-circle"
                                    loading="eager"
                                    width={100}
                                    height={100}
                                    placeholder="blur"
                                    blurDataURL="/images/1x1placeholder.png"
                                    quality={75}
                                  />
                                </div>

                                <span className="ms-2">
                                  by {article.author?.firstname} {article.author?.lastname}
                                </span>
                              </div>
                            </Nav.Link>
                          </Nav.Item>

                          <Nav.Item as="li">
                            <RelativeTime value={article.created ?? ""} />
                          </Nav.Item>
                        </Nav>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
          {isLoadingRelated && (
              <div className="text-center py-2">Loading related articles…</div>
            )}
        </div>
        {hasMoreRelated && (
            <div ref={relatedSentinelRef} style={{ height: 1 }} aria-hidden="true" />
          )}
        </>
      )}

      {tab === "comment" && (
        <div className="mt-3">
          {isAuthenticated && (
            <div
              className="px-3 pt-3 pb-2 rounded"
              style={{
                background: "#f8f9fa",
                boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Form onSubmit={submitComment}>
                {socketError && (
                  <div className="mb-2" style={{ color: "red" }}>
                    {socketError}
                  </div>
                )}

                <Form.Control
                  name="comment"
                  as="textarea"
                  rows={3}
                  placeholder="Write a comment..."
                />

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    className="text-end p-0"
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: "black",
                      borderColor: "#f8f9fa",
                    }}
                  >
                    <i className="bi bi-postcard" style={{ fontSize: 30 }}></i>
                  </Button>
                </div>
              </Form>
            </div>
          )}

          <div
            ref={commentsScrollRef}
            className="px-3 pt-3 pb-2 mb-3 rounded mt-3"
            style={{
              background: "#f8f9fa",
              boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
              height: "700px",
              overflowX: "hidden",
              overflowY: "scroll",
            }}
          >
            <div className="comments-list">
              {commentState.length === 0 && (
                <p>Be the first to write a comment.</p>
              )}

              {commentState.map((comment, index) => {
                const commentNode = comment.node;

                return (
                  <div
                    className={`comment-box ${index > 0 ? "mt-2" : ""}`}
                    key={`${commentNode.created}-${commentNode.user.firstname}-${commentNode.user.lastname}-${index}`}
                  >
                    <Row className="g-0">
                      <Col xs={2}>
                        {commentNode.user.avatarUrl ? (
                          <Image
                            className="rounded-circle"
                            src={commentNode.user.avatarUrl}
                            alt={`Image of ${commentNode.user.firstname} ${commentNode.user.lastname}`}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <i
                            className="bi bi-person-circle"
                            style={{ fontSize: "20px" }}
                          ></i>
                        )}
                      </Col>

                      <Col xs={10}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">
                            {commentNode.user.firstname}{" "}
                            {commentNode.user.lastname}
                          </h6>
                          <span className="comment-time">
                            <RelativeTime value={commentNode.created ?? ""} />
                          </span>
                        </div>

                        <p className="mb-2">{commentNode.body}</p>
                      </Col>
                    </Row>
                  </div>
                );
              })}

              {isLoadingComments && (
                <div className="text-center py-2">Loading comments…</div>
              )}

              {hasMoreComments && (
                <div
                  ref={commentsSentinelRef}
                  style={{ height: 1 }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "article" && (
        <div
          className="border rounded px-3 pt-1 mt-3 mb-1"
          style={{ backgroundColor: "rgba(136, 105, 12, 0.2)" }}
        >
          <p>
            {articleCollapse === "....Read More" ? body.substring(0, 200) : body}
            &nbsp;&nbsp;
            <span onClick={toggleArticleCollapse}>
              <strong>{articleCollapse}</strong>
            </span>
          </p>
        </div>
      )}
    </Col>
  );
}