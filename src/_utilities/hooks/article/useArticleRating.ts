"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import { ArticleService } from "@/_services/articles/articleservices";
import { getSession } from "@/_navigation/server/session";

interface Props {
  articleId: string;
}

export function useArticleRating({ articleId }: Props) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const [rating, setRating] = useState(0);
  const [canRate, setCanRate] = useState<boolean | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setCanRate(false);
      return;
    }

    async function loadRatingStatus() {
        try {
            const token = await getSession()
            const has_rate = await ArticleService.canRate(token, articleId)
            setCanRate(!has_rate.data?.has_rated)
            
        } catch(e){
            setCanRate(false)
        }
    }

    loadRatingStatus();
  }, [articleId, isAuthenticated]);

  const submitRating = async (value: number) => {
    if (!isAuthenticated || canRate === false) return;
    const token = await getSession()
    setIsSubmitting(true);
    setRating(value);

    try {
        const message = await ArticleService.submitRate(token, articleId, value);

        if(message.success){
            setCanRate(false)
        }
    } finally {
        setIsSubmitting(false)
    } 
  };

  return {
    isAuthenticated,
    rating,
    canRate,
    isSubmitting,
    submitRating,
  };
}