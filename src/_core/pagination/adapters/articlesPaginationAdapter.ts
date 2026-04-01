import { ArticleService } from "@/_services/articles/articleservices";
import type { Article } from "@/_types/articles/article.types";
import type { PaginationAdapter } from "../type";

export interface ArticleEdge {
  node: Article;
}

export interface ArticlesAdapterParams {
  category?: string;
}

export const articlesPaginationAdapter: PaginationAdapter<
  ArticleEdge,
  string,
  ArticlesAdapterParams
> = {
  load: async (cursor, params) => {
    const response = await ArticleService.getArticle(
      params.category,
      cursor ?? undefined
    );

    return {
      items: response?.articles?.edges ?? [],
      nextCursor: response?.articles?.pageInfo?.endCursor ?? null,
      hasMore: Boolean(response?.articles?.pageInfo?.hasNextPage),
    };
  },
};