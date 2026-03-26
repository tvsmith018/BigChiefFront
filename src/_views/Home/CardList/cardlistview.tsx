"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Link from "next/link";

import { RelativeTime } from "@/_core/date/RelativeTime";
import { ArticleService } from "@/_services/articles/articleservices";
import { Article } from "@/_types/articles/article.types";

interface Props {
  list: { node: Article }[];
  title: string;
  category?: string;
  pageInfo: { hasNextPage:boolean, endCursor:string}
}

export default function CardListView({ list, title, pageInfo ,category }: Props) {
  const [articles, setArticles] = useState(list);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(pageInfo.hasNextPage);
  const [endCursor, setEndCursor] = useState<string>(pageInfo.endCursor)

  /** 🔒 refs to avoid stale closures */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(isLoading);

  /** keep refs in sync */
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  const loadMore = async () => {

    if (loadingRef.current || !hasMoreRef.current) return;
    setIsLoading(true);
    const newArticles = await ArticleService.getArticle(category,endCursor);
    setArticles((prev) => [...prev, ...newArticles.articles.edges]);
    if (newArticles.articles.pageInfo.hasNextPage) setEndCursor(newArticles.articles.pageInfo.endCursor)
    setHasMore(newArticles.articles.pageInfo.hasNextPage)
    observerRef.current?.disconnect();
    setIsLoading(false);
  };

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    });

    observerRef.current.observe(node);
  }, []);

  return (
    <section className="position-relative pt-0 pb-3">
      <Container>
        <h3 className="mb-4">{title}</h3>

        <Row className="g-4 mb-2">
          {articles.map(({ node }, index) => (
            <Col sm={6} lg={4} key={index}>
              <Card>
                <div className="ratio ratio-16x9">
                  <Image
                    src={node.image4x3Url ?? "/images/4x3placeholder.png"}
                    alt={node.altImage ?? ""}
                    className="card-img"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <Card.Body>
                  <span className={`badge ${node.badgeColor} mb-2`}>
                    {node.category}
                  </span>

                  <h5>
                    <Link
                      href={`/articles/details/${node.id}`}
                      className="stretched-link text-reset fw-bold"
                    >
                      {node.title}
                    </Link>
                  </h5>

                  <Nav as="ul" className="nav-divider align-items-center small">
                    
                    <Nav.Item as="li">
                      <Nav.Link as="div">
                        <div className="d-flex align-items-center position-relative">
                          <div className="avatar avatar-sm">
                            <Image
                              src={node.author?.avatarUrl ?? ""}
                              alt={`${node.author?.firstname} ${node.author?.lastname}`}
                              className="avatar-img rounded-circle"
                              width={100}
                              height={100}
                              placeholder="blur"
                              blurDataURL="/images/1x1placeholder.png"
                            />
                          </div>

                          <span className="ms-2">
                            by{" "}
                            <span className="stretched-link btn-link">
                              {node.author?.firstname}{" "}
                              {node.author?.lastname}
                            </span>
                          </span>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                      <RelativeTime value={node.created!} />
                    </Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {isLoading && <p className="text-center">Loading…</p>}

        {/* 👇 observer target */}
        {hasMore && <div ref={sentinelRef} />}
      </Container>
    </section>
  );
}
