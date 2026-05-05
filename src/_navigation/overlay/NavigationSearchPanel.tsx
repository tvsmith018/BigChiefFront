"use client";

import { motion, AnimatePresence } from "framer-motion";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Image from "next/image";
import Link from "next/link";

import { useNavigationSearch } from "../hooks/UseNavigationSearch";
import { useNavigationUI } from "../context/NavigationUIContext";
import { fadeSlide } from "../animations/navigation.motion";
import type { Article } from "@/_types/articles/article.types";
import { PROFILE_AVATAR_PLACEHOLDER } from "@/_constants/profilePlaceholders";
import { toHttpsUrl } from "@/_utilities/url/toHttpsUrl";

export default function NavigationSearchPanel() {
  const { closeSearch } = useNavigationUI();
  const {
    query,
    articleResults,
    profileResults,
    isSearching,
    executeSearch,
    resetSearch,
  } = useNavigationSearch();

  const hasQuery = query.trim().length > 0;
  const articles = articleResults.slice(0, 5);
  const profiles = profileResults.slice(0, 5);
  const hasResults = articles.length > 0 || profiles.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeSlide}
      className="d-flex flex-column"
      style={{ minHeight: 0, overflowX: "hidden", width: "100%", maxWidth: "100%" }}
    >
      <div className="mb-3">
        <h6 className="fw-bold mb-1">Search</h6>
        <p className="text-muted small mb-0">
          Articles and profiles in one place.
        </p>
      </div>

      <Form>
        <Form.Group className="position-relative">
          <i
            className="bi bi-search position-absolute text-muted"
            style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <Form.Control
            type="search"
            value={query}
            placeholder="Search articles or people..."
            className="shadow-none rounded-pill ps-5 pe-5 py-2 border-2"
            onChange={(e) => executeSearch(e.target.value)}
          />
          {hasQuery && (
            <button
              type="button"
              aria-label="Clear search"
              className="btn btn-sm position-absolute border-0 bg-transparent text-muted"
              style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }}
              onClick={resetSearch}
            >
              <i className="bi bi-x-circle" />
            </button>
          )}
        </Form.Group>
      </Form>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            className="d-flex align-items-center justify-content-center gap-2 mt-3 py-2 rounded-3 bg-light-subtle border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Spinner size="sm" />
            <span className="small text-muted">Searching...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="mt-3 pe-1"
        style={{
          maxHeight: "calc(100vh - 240px)",
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <AnimatePresence>
          {!isSearching && hasQuery && !hasResults && (
            <motion.div
              key="search-empty-state"
              className="mt-1 p-4 border rounded-3 text-center bg-light-subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="mb-1 fw-semibold">No results found</p>
              <p className="mb-0 small text-muted">Try a different keyword.</p>
            </motion.div>
          )}

          {!isSearching && hasQuery && hasResults && (
            <motion.div
              key="search-results-state"
              className="d-grid gap-3"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeSlide}
              style={{ width: "100%", maxWidth: "100%" }}
            >
              <section className="border rounded-3 bg-white p-2 w-100 overflow-hidden">
                <div className="d-flex align-items-center justify-content-between px-2 py-1 mb-1">
                  <h6 className="mb-0">Articles</h6>
                  {articles.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                    >
                      View more
                    </button>
                  )}
                </div>

                <div className="d-grid gap-2">
                  {articles.map((edge: { node: Article }, index: number) => {
                    const article = edge.node;
                    const articleKey = article.id ? `article-${article.id}` : `article-fallback-${index}`;
                    return (
                      <Link
                        key={articleKey}
                        href={`/articles/details/${article.id}/`}
                        className="text-reset text-decoration-none d-block w-100 overflow-hidden"
                        onClick={closeSearch}
                      >
                        <div className="d-flex align-items-center gap-3 rounded-3 p-2 bg-light-subtle border w-100 overflow-hidden">
                          <Image
                            src={toHttpsUrl(article.image1x1Url) ?? "/images/1x1placeholder.png"}
                            alt={article.altImage ?? article.title ?? "Article image"}
                            width={62}
                            height={62}
                            className="rounded-3 flex-shrink-0"
                          />
                          <div className="overflow-hidden" style={{ minWidth: 0 }}>
                            <p className="fw-semibold mb-1 text-truncate">{article.title ?? "Untitled"}</p>
                            <small className="text-muted">Read article</small>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {articles.length === 0 && (
                    <div className="small text-muted px-2 py-2">No article matches yet.</div>
                  )}
                </div>
              </section>

              <section className="border rounded-3 bg-white p-2 w-100 overflow-hidden">
                <div className="d-flex align-items-center justify-content-between px-2 py-1 mb-1">
                  <h6 className="mb-0">Profiles</h6>
                  {profiles.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                    >
                      View more
                    </button>
                  )}
                </div>

                <div className="d-grid gap-2">
                  {profiles.map((profile, index) => (
                    <Link
                      key={profile.id ? `profile-${profile.id}` : `profile-fallback-${index}`}
                      href={`/profile/${profile.id}/`}
                      className="text-reset text-decoration-none d-block w-100 overflow-hidden"
                      onClick={closeSearch}
                    >
                      <div className="d-flex align-items-center gap-3 rounded-3 p-2 bg-light-subtle border w-100 overflow-hidden">
                        <div
                          className="position-relative rounded-circle overflow-hidden flex-shrink-0 border"
                          style={{ width: 48, height: 48 }}
                        >
                          <Image
                            src={toHttpsUrl(profile.avatarUrl) ?? PROFILE_AVATAR_PLACEHOLDER}
                            alt={`${profile.firstname} ${profile.lastname}`}
                            fill
                            sizes="48px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="overflow-hidden" style={{ minWidth: 0 }}>
                          <p className="fw-semibold mb-0 text-truncate">
                            {`${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim() || "User"}
                          </p>
                          <small className="text-muted">View profile</small>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {profiles.length === 0 && (
                    <div className="small text-muted px-2 py-2">No profile matches yet.</div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
