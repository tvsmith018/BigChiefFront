"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PaginationResult,
  UsePaginatedCollectionOptions,
  UsePaginatedCollectionReturn,
} from "./type";
import { mergeUniqueItems } from "./utils";

export function usePaginatedCollection<
  TItem,
  TCursor = string,
  TParams = void
>({
  initialItems,
  initialCursor,
  initialHasMore,
  adapter,
  params,
  enabled = true,
  resetKey,
  getItemId,
  dedupe = true,
  onLoadStart,
  onLoadSuccess,
  onLoadError,
  onLoadFinally,
}: UsePaginatedCollectionOptions<TItem, TCursor, TParams>): UsePaginatedCollectionReturn<TItem, TCursor> {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [cursor, setCursor] = useState<TCursor | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const cursorRef = useRef<TCursor | null>(initialCursor);
  const hasMoreRef = useRef(initialHasMore);
  const loadingRef = useRef(false);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setIsLoading(false);
    setError(null);

    cursorRef.current = initialCursor;
    hasMoreRef.current = initialHasMore;
    loadingRef.current = false;
  }, [initialItems, initialCursor, initialHasMore]);

  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  const runLoad = useCallback(async () => {
    if (!enabled) return;
    if (loadingRef.current) return;
    if (!hasMoreRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    onLoadStart?.();

    try {
      const result: PaginationResult<TItem, TCursor> = await adapter.load(
        cursorRef.current,
        params
      );

      setItems((prev) =>
        mergeUniqueItems(prev, result.items, getItemId, dedupe)
      );
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);

      cursorRef.current = result.nextCursor;
      hasMoreRef.current = result.hasMore;

      onLoadSuccess?.(result);
    } catch (err) {
      setError(err);
      onLoadError?.(err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      onLoadFinally?.();
    }
  }, [
    enabled,
    adapter,
    params,
    getItemId,
    dedupe,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onLoadFinally,
  ]);

  const retry = useCallback(async () => {
    await runLoad();
  }, [runLoad]);

  return {
    items,
    isLoading,
    isInitialEmpty: items.length === 0 && !isLoading,
    hasMore,
    cursor,
    error,

    loadMore: runLoad,
    retry,
    reset,
    replaceItems: setItems,
    setCursor,
    setHasMore,
  };
}