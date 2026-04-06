"use client";

import { useState, useRef, useCallback } from "react";
import { ArticleService } from "@/_services/articles/articleservices";
import type { Article } from "@/_types/articles/article.types";

/**
 * Navigation-level search logic.
 * UI-agnostic, debounced, reusable.
 */
export function useNavigationSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Array<{ node: Article }>>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const executeSearch = useCallback((value: string) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setResults([]);
        setQuery("");
        return;
      }

      setIsSearching(true);
      setQuery(value);

      try {
        const search_result = await ArticleService.fetchSearch(value);
        setResults(search_result ?? []);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const resetSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setQuery("");
    setResults([]);
    setIsSearching(false);
  };

  return {
    query,
    results,
    isSearching,
    executeSearch,
    resetSearch,
  };
}
