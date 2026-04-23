import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import Link from "next/link";

import { RelativeTime } from "@/_core/date/RelativeTime";
import { Article } from "@/_types/articles/article.types";

interface SecondaryArticleListProps {
  articles: Array<{ node: Article }>;
}

export function SecondaryArticleList({
  articles,
}: SecondaryArticleListProps) {
  return (
    <>
      {articles!.map((nodeEdge, index) => {
        const node = nodeEdge.node
        return(
        <Card className="mb-3" key={node.id ?? index}>
          <Row className="g-3 mb-3">
            <Col xs={4}>
              <Image
                src={node.image4x3Url ?? ""}
                alt={node.altImage ?? ""}
                className="rounded-3"
                width={1000}
                height={750}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="/images/4x3placeholder.png"
                quality={75}
              />
            </Col>

            <Col xs={8}>
              <span className={`badge ${node.badgeColor} mb-2`}>
                <i className="bi bi-record-fill me-1" />
                {node.category}
              </span>

              <h5>
                <Link
                  href={`/articles/details/${node.id}`}
                  className="btn-link stretched-link text-reset fw-bold"
                >
                  {node.title}
                </Link>
              </h5>

              <Nav
                as="ul"
                className="nav-divider align-items-center d-none d-sm-inline-block small"
              >
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
                  <RelativeTime value={node.created ?? ""} />
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card>
        )})}
    </>
  );
}
