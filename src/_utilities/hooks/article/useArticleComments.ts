"use client";

import { FormEvent, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ArticleService } from "@/_services/articles/articleservices";

interface ArticleComment{
  node: {
    user: {
      firstname:string,
      lastname:string,
      avatarUrl?:string
    },
    body:string,
    created:string
  }
}

interface Props {
  articleId: string;
  initialComments: ArticleComment[];
  pageInfo: {
    hasNextPage:boolean,
    endCursor: string
  }
}

export function useArticleComments({ articleId, initialComments, pageInfo }: Props) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const data = useAppSelector((state) => state.user.data)

  const [commentState, setCommentState] = useState<ArticleComment[]>(initialComments);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(pageInfo.hasNextPage)
  const [endcursor, setEndCursor] = useState<string>(pageInfo.endCursor)
  const [isLoading, setIsLoading] = useState(false);
  const [socketError, setSocketError] = useState<string | undefined>(undefined);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasMoreRef = useRef(hasMoreComments);
  const loadingRef = useRef(isLoading);

  const socketUrl = useMemo(
    () => `wss://bigchiefnewz-a2e8434d1e6d.herokuapp.com/ws/articles/${articleId}/`,
    [articleId]
  );
  
  useEffect(() => {
    hasMoreRef.current = hasMoreComments;
  }, [hasMoreComments]);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  const loadMoreComments = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setIsLoading(true);
    const newComments = await ArticleService.fetchMoreComments(articleId,endcursor)
    setCommentState((prev) => [...prev, ...newComments.comments.edges])
    if (newComments.comments.pageInfo.hasNextPage) setEndCursor(newComments.comments.pageInfo.endCursor)
    setHasMoreComments(newComments.comments.pageInfo.hasNextPage)
    observerRef.current?.disconnect();
    setIsLoading(false);
  }

  const commentsSentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMoreComments();
      }
    });

    observerRef.current.observe(node);
  }, []);

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

      setCommentState((prev) => [nextComment, ...prev]);
    };

    ws.onerror = () => {
      setSocketError("Error with comment communication, please try again");
    };

    return () => ws.close();
  }, [socketUrl]);

  useEffect(()=>{},[])

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) return;

    const ws = new ReconnectingWebSocket(socketUrl);

    const form = event.currentTarget
    const formData = new FormData(event.currentTarget);
    const body = formData.get("comment");
    
    try {
      ws.onopen = () => {
        ws.send(JSON.stringify({ body, user_id: data.id}));
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
    hasMoreComments
  };
}