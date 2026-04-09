"use client";

import FormCheck from "react-bootstrap/FormCheck";
import FormLabel from "react-bootstrap/FormLabel";
import { useArticleRating } from "@/_utilities/hooks/article/useArticleRating";

export default function ArticleRatingView({ articleId }: { articleId: string }) {
  const { isAuthenticated, rating, canRate, submitRating } = useArticleRating({
    articleId,
  });

  if (!isAuthenticated) return <div>Login to Rate</div>;
  if (canRate === false) return <div>Rate Submitted</div>;
  if (canRate === undefined) return <div>Loading...</div>;

  return (
    <>
      {[...Array(5)].map((_, index) => {
        const currentRate = index + 1;

        return (
          <FormLabel key={index}>
            <FormCheck type="radio" name="rate" value={currentRate} disabled/>
            <button
              type="button"
              className="border-0 bg-transparent p-0 align-baseline shadow-none d-inline"
              style={{ lineHeight: 0, verticalAlign: "baseline" }}
              aria-label={`Rate ${currentRate} out of 5 stars`}
              onClick={() => submitRating(currentRate)}
            >
              <i
                className="bi bi-star-fill pe-2"
                style={{
                  fontSize: 20,
                  color: currentRate <= rating ? "rgba(255, 193, 7, 0.7)" : "grey",
                  cursor: "pointer",
                }}
              />
            </button>
          </FormLabel>
        );
      })}
    </>
  );
}