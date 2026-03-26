"use client";

import { motion, AnimatePresence } from "framer-motion";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";

import { useNavigationSearch } from "../hooks/UseNavigationSearch";
import { fadeSlide } from "../animations/navigation.motion";
import { ArticleType } from "@/_utilities/datatype/types";

export default function NavigationSearchPanel() {
  const {
    results,
    isSearching,
    executeSearch,
  } = useNavigationSearch();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeSlide}
    >
      <Form>
        <Form.Group>
          <Form.Control
            type="search"
            placeholder="Search articles..."
            className="shadow-none rounded-pill"
            onChange={(e) => executeSearch(e.target.value)}
          />
        </Form.Group>
      </Form>

      <AnimatePresence>
      {isSearching && (
        <motion.div 
          className="d-flex justify-content-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Spinner />
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {!isSearching &&
        results.map((node: ArticleType, index: number) => {
          const article = node.node;
          return (
            <motion.div
                key={article.id ?? index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeSlide}
              >
            <Row className="g-3 mt-2">
              <Col xs={3}>
                <Image
                  src={article.image1x1Url ?? "/images/1x1placeholder.png"}
                  alt={article.altImage ?? ""}
                  width={100}
                  height={100}
                  className="rounded-3"
                />
              </Col>

              <Col xs={9}>
                <a
                  href={`/articles/details/${article.id}/`}
                  className="fw-bold text-reset"
                >
                  {article.title}
                </a>
              </Col>
            </Row>
            </motion.div>
          );
        })}
        </AnimatePresence>
    </motion.div>
  );
}
