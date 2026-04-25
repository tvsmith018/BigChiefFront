"use client";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Link from "next/link";

import { RelativeTime } from "@/_core/date/RelativeTime";
import {
  ArticleEdge,
  articlesPaginationAdapter,
  useInfiniteObserver,
  usePaginatedCollection,
} from "@/_core/pagination";
import { toHttpsUrl } from "@/_utilities/url/toHttpsUrl";


interface Props {
  list: ArticleEdge[];
  title: string;
  category?: string;
  pageInfo: { 
    hasNextPage:boolean, 
    endCursor:string|null
  }
}

export default function CardListView({ list, title, pageInfo ,category }: Props) {

  const {
    items: articles,
    isLoading,
    hasMore,
    loadMore,
  } = usePaginatedCollection<ArticleEdge, string, { category?: string }>({
    initialItems: list,
    initialCursor: pageInfo.endCursor,
    initialHasMore: pageInfo.hasNextPage,
    adapter: articlesPaginationAdapter,
    params: { category },
    resetKey: category ?? "all",
    getItemId: (item) => item.node.id ?? "",
    dedupe: true,
  });

  const { sentinelRef } = useInfiniteObserver({
    enabled: true,
    hasMore,
    isLoading,
    onIntersect: loadMore,
    rootMargin: "300px 0px",
    threshold: 0,
  });
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
                    src={toHttpsUrl(node.image4x3Url) ?? "/images/4x3placeholder.png"}
                    alt={node.altImage ?? ""}
                    className="card-img"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <Card.Body>
                  <span className={`badge ${node.badgeColor} mb-2`}>
                    <i className="bi bi-record-fill" />
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
                              src={toHttpsUrl(node.author?.avatarUrl) ?? "/images/1x1placeholder.png"}
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
        {hasMore && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />}
      </Container>
    </section>
  );
}
