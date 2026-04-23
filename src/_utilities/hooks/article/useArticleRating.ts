"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import { ArticleService } from "@/_services/articles/articleservices";

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
            const has_rate = await ArticleService.canRate(articleId)
            setCanRate(!has_rate.data.has_rated)
            
        } catch {
            setCanRate(false)
        }
    }

    loadRatingStatus();
  }, [articleId, isAuthenticated]);

  const submitRating = async (value: number) => {
    if (!isAuthenticated || canRate === false) return;
    setIsSubmitting(true);
    setRating(value);

    try {
        const message = await ArticleService.submitRate(articleId, value);

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
