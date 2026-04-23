"use client";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { FeaturedHeroCard } from "./FeaturedHeroCard";
import { SecondaryArticleList } from "./SecondaryArticleList";
import { Article } from "@/_types/articles/article.types";

interface HeaderSectionProps {
  featured: {node:Article};
  secondary: Array<{ node: Article }>;
}

export default function HeaderSection({
  featured,
  secondary,
}: HeaderSectionProps) {
  return (
    <section className="pt-4 pb-2">
      <Container>
        <Row>
          <Col lg={7}>
            <FeaturedHeroCard articleNode={featured} />
          </Col>

          <Col lg={5} className="mt-4 mt-lg-0">
            <SecondaryArticleList articles={secondary} />
          </Col>
        </Row>
      </Container>
    </section>
  );
}
