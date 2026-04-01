import type { PaginationAdapter } from "../type";
import { ArticleService } from "@/_services/articles/articleservices";

export const relatedPaginationAdapter = {
  load: async (
    cursor: string | null,
    params: { category: string; articleId: string }
  ) => {
    const data = await ArticleService.fetchMore(
      params.category,
      params.articleId,
      5,
      cursor ?? ""
    );

    return {
      items: data.categoryArticles.edges ?? [],
      nextCursor: data.categoryArticles.pageInfo.endCursor ?? null,
      hasMore: Boolean(data.categoryArticles.pageInfo.hasNextPage),
    };
  },
};