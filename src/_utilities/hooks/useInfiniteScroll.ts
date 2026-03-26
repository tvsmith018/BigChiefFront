"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollProps<T> {
  initialItems: T[];
  fetchMore: (offset: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteScroll<T>({
  initialItems,
  fetchMore,
  pageSize = 12,
}: UseInfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= pageSize);

  const offsetRef = useRef(initialItems.length);
  const hasMoreRef = useRef(hasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // keep ref in sync (prevents stale closure bugs)
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadMore = async () => {
    if (loading || !hasMoreRef.current) return;

    setLoading(true);

    const newItems = await fetchMore(offsetRef.current);

    setItems((prev) => [...prev, ...newItems]);
    offsetRef.current += newItems.length;

    if (newItems.length < pageSize) {
      setHasMore(false);
    }

    setLoading(false);
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

  return {
    items,
    loading,
    hasMore,
    sentinelRef,
  };
}
