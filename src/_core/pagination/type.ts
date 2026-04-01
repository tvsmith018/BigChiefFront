import type { Dispatch, SetStateAction } from "react";

export type PaginationCursor = string | number | null;

export interface PaginationResult<TItem, TCursor = string> {
  items: TItem[];
  nextCursor: TCursor | null;
  hasMore: boolean;
}

export interface PaginationAdapter<TItem, TCursor = string, TParams = void> {
  load: (
    cursor: TCursor | null,
    params: TParams
  ) => Promise<PaginationResult<TItem, TCursor>>;
}

export interface UsePaginatedCollectionOptions<
  TItem,
  TCursor = string,
  TParams = void
> {
  initialItems: TItem[];
  initialCursor: TCursor | null;
  initialHasMore: boolean;

  adapter: PaginationAdapter<TItem, TCursor, TParams>;
  params: TParams;

  enabled?: boolean;
  resetKey?: string | number;

  getItemId?: (item: TItem) => string | number;
  dedupe?: boolean;

  onLoadStart?: () => void;
  onLoadSuccess?: (result: PaginationResult<TItem, TCursor>) => void;
  onLoadError?: (error: unknown) => void;
  onLoadFinally?: () => void;
}

export interface UsePaginatedCollectionReturn<TItem, TCursor = string> {
  items: TItem[];
  isLoading: boolean;
  isInitialEmpty: boolean;
  hasMore: boolean;
  cursor: TCursor | null;
  error: unknown | null;

  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  replaceItems: Dispatch<SetStateAction<TItem[]>>;
  setCursor: Dispatch<SetStateAction<TCursor | null>>;
  setHasMore: Dispatch<SetStateAction<boolean>>;
}

export interface UseInfiniteObserverOptions {
  enabled?: boolean;
  hasMore: boolean;
  isLoading: boolean;
  onIntersect: () => void | Promise<void>;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number;
}