"use client";

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Link from "next/link";

import { ContentCarousel } from "@/_utilities/carousel/ContentCarousel";
import { RelativeTime } from "@/_core/date/RelativeTime";
import { Article } from "@/_types/articles/article.types";

export default function FeaturedArticlesCarousel({
  articles,
}: {
  articles: { node: Article }[];
}) {
  return (
    <ContentCarousel
      title="Featured"
      items={articles}
      renderItem={({ node }) => {
        const article = node;

        return (
          <Card>
            <Row className="g-2">
              <Col xs={3}>
                <Image
                  src={article.image1x1Url ?? "/images/1x1placeholder.png"}
                  alt={article.altImage ?? ""}
                  className="img-fluid rounded-3"
                  width={100}
                  height={100}
                  placeholder="blur"
                  blurDataURL="/images/1x1placeholder.png"
                />
              </Col>

              <Col xs={9} className="mt-2">
                <h5>
                  <Link
                    href={`/articles/details/${article.id}`}
                    className="btn-link stretched-link text-reset fw-bold"
                  >
                    {article.title}
                  </Link>
                </h5>

                <Nav as="ul" className="nav-divider align-items-center small">
                  <Nav.Item as="li">
                    <span>
                      by {article.author?.firstname}{" "}
                      {article.author?.lastname}
                    </span>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <RelativeTime value={article.created ?? ""} />
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
          </Card>
        );
      }}
    />
  );
}
