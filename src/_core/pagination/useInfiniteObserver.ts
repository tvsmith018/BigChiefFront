"use client";

import { useCallback, useEffect, useRef } from "react";
import type { UseInfiniteObserverOptions } from "./type";

export function useInfiniteObserver({
  enabled = true,
  hasMore,
  isLoading,
  onIntersect,
  root = null,
  rootMargin = "300px 0px",
  threshold = 0,
}: UseInfiniteObserverOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();

      if (!node || !enabled || !hasMore) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (isLoading) return;
          void onIntersect();
        },
        {
          root,
          rootMargin,
          threshold,
        }
      );

      observerRef.current.observe(node);
    },
    [enabled, hasMore, isLoading, onIntersect, root, rootMargin, threshold]
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { sentinelRef };
}