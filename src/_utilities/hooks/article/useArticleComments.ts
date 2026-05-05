"use client";

import { FormEvent, useEffect, useMemo, useState, RefObject } from "react";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ArticleComment } from "@/_services/articles/articleservices";
import { WEBSOCKET_BASE_URL } from "@/_network/config/endpoints";
import {
  commentsPaginationAdapter,
  useInfiniteObserver,
  usePaginatedCollection,
} from "@/_core/pagination";


interface Props {
  articleId: string;
  initialComments: ArticleComment[];
  pageInfo: {
    hasNextPage:boolean,
    endCursor: string
  }
  scrollRootRef?: RefObject<HTMLDivElement | null>;
}

function isSameComment(left: ArticleComment, right: ArticleComment) {
  return (
    left.node.body === right.node.body &&
    left.node.created === right.node.created &&
    left.node.user.firstname === right.node.user.firstname &&
    left.node.user.lastname === right.node.user.lastname
  );
}

function upsertComment(
  current: ArticleComment[],
  next: ArticleComment,
) {
  const exists = current.some((item) => isSameComment(item, next));
  if (exists) return current;
  return [next, ...current];
}

export function useArticleComments({ articleId, initialComments, pageInfo,scrollRootRef }: Props) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const data = useAppSelector((state) => state.user.data)
  const [socketError, setSocketError] = useState<string | undefined>(undefined);

  const socketUrl = useMemo(
    () => `${WEBSOCKET_BASE_URL}/ws/articles/${articleId}/`,
    [articleId]
  );
  
   const {
    items: commentState,
    isLoading,
    hasMore: hasMoreComments,
    error,
    loadMore,
    retry,
    replaceItems,
  } = usePaginatedCollection<ArticleComment, string, { articleId: string }>({
    initialItems: initialComments,
    initialCursor: pageInfo.endCursor,
    initialHasMore: pageInfo.hasNextPage,
    adapter: commentsPaginationAdapter,
    params: { articleId },
    resetKey: articleId,
    dedupe: true,
    getItemId: (item) =>
      `${item.node.created}-${item.node.user.firstname}-${item.node.user.lastname}-${item.node.body}`,
  });

  const { sentinelRef: commentsSentinelRef } = useInfiniteObserver({
    enabled: true,
    hasMore: hasMoreComments,
    isLoading,
    onIntersect: loadMore,
    root: scrollRootRef?.current ?? null,
    rootMargin: "150px 0px",
    threshold: 0,
  });

  useEffect(() => {
    const ws = new ReconnectingWebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const nextComment: ArticleComment = {
        node: {
          body: data.body,
          created: data.created,
          user: {
            avatarUrl: data.avatarUrl,
            firstname: data.firstname,
            lastname: data.lastname,
          },
        },
      };

      replaceItems((prev) => upsertComment(prev, nextComment));
    };

    ws.onerror = () => {
      setSocketError("Error with comment communication, please try again");
    };

    return () => ws.close();
  }, [replaceItems, socketUrl]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) return;

    const ws = new ReconnectingWebSocket(socketUrl);

    const form = event.currentTarget
    const formData = new FormData(event.currentTarget);
    const body = formData.get("comment");
    
    try {
      ws.onopen = () => {
        ws.send(JSON.stringify({ body, user_id: data?.id }));
        ws.close();
        form.reset()
      };
    } catch {
      setSocketError("Error with comment communication, please try again");
    }
  };

  return {
    commentState,
    socketError,
    submitComment,
    commentsSentinelRef,
    hasMoreComments,
    isLoadingComments: isLoading,
    commentsError: error,
    retryComments: retry,
  };
}
