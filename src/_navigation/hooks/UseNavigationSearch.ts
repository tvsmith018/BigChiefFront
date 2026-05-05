"use client";

import { useState, useRef, useCallback } from "react";
import { ArticleService } from "@/_services/articles/articleservices";
import type { Article } from "@/_types/articles/article.types";
import type { NavigationSearchResult } from "@/_services/articles/articleservices";

type SearchProfile = NavigationSearchResult["profiles"][number];

/**
 * Navigation-level search logic.
 * UI-agnostic, debounced, reusable.
 */
export function useNavigationSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [articleResults, setArticleResults] = useState<Array<{ node: Article }>>([]);
  const [profileResults, setProfileResults] = useState<SearchProfile[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  const executeSearch = useCallback((value: string) => {
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setArticleResults([]);
        setProfileResults([]);
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsSearching(true);

      try {
        const searchResult = await ArticleService.fetchNavigationSearch(value);

        if (requestIdRef.current !== requestId) {
          return;
        }

        setArticleResults(searchResult.articles ?? []);
        setProfileResults(searchResult.profiles ?? []);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSearching(false);
        }
      }
    }, 500);
  }, []);

  const resetSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setQuery("");
    setArticleResults([]);
    setProfileResults([]);
    setIsSearching(false);
  };

  return {
    query,
    articleResults,
    profileResults,
    isSearching,
    executeSearch,
    resetSearch,
  };
}
