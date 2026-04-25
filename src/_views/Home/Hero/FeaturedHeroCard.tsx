import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Link from "next/link";

import { RelativeTime } from "@/_core/date/RelativeTime";
import { Article } from "@/_types/articles/article.types";
import { toHttpsUrl } from "@/_utilities/url/toHttpsUrl";

interface FeaturedHeroCardProps {
  articleNode: {node:Article};
}

export function FeaturedHeroCard({ articleNode }: FeaturedHeroCardProps) {
    const article = articleNode!.node
  return (
    <Card
      className="card-overlay-bottom h-400 h-lg-560 rounded-3"
      style={{
        backgroundImage: `url(${toHttpsUrl(article.image16x9Url) ?? "/images/4x3placeholder.png"})`,
        backgroundPosition: "center left",
        backgroundSize: "cover",
      }}
    >
      <div className="card-img-overlay d-flex flex-column p-3 p-sm-5">
        <div className="w-100 mt-auto">
          <Col>
            <span className={`badge ${article.badgeColor} mb-2`}>
              <i className="bi bi-record-fill me-1" />
              {article.category}
            </span>

            <h2 className="text-white display-5">
              <Link
                href={`/articles/details/${article.id}`}
                className="btn-link text-reset stretched-link fw-normal"
              >
                {article.title}
              </Link>
            </h2>

            <p className="text-white">{article.briefsummary ?? ""}</p>

            <Nav
              as="ul"
              className="nav-divider align-items-center d-none d-sm-inline-block small text-white"
            >
              <Nav.Item as="li">
                <Nav.Link as="div">
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-sm">
                      <Image
                        src={toHttpsUrl(article.author?.avatarUrl) ?? "/images/1x1placeholder.png"}
                        alt={`${article.author?.firstname} ${article.author?.lastname}`}
                        className="avatar-img rounded-circle"
                        width={100}
                        height={100}
                        placeholder="blur"
                        blurDataURL="/images/1x1placeholder.png"
                      />
                    </div>

                    <span className="ms-2">
                      by{" "}
                      <span className="stretched-link btn-link text-white">
                        {article.author?.firstname}{" "}
                        {article.author?.lastname}
                      </span>
                    </span>
                  </div>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item as="li">
                <RelativeTime value={article.created ?? ""} />
              </Nav.Item>
            </Nav>
          </Col>
        </div>
      </div>
    </Card>
  );
}
