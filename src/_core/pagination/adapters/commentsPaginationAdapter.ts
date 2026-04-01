import type { PaginationAdapter } from "../type";
import { ArticleService } from "@/_services/articles/articleservices";

export interface ArticleComment{
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

interface CommentsAdapterParams {
  articleId: string;
}

export const commentsPaginationAdapter: PaginationAdapter<
  ArticleComment,
  string,
  CommentsAdapterParams
> = {
  load: async (cursor, params) => {
    const response = await ArticleService.fetchMoreComments(
      params.articleId,
      cursor ?? undefined
    );

    return {
      items: response?.comments?.edges ?? [],
      nextCursor: response?.comments?.pageInfo?.endCursor ?? null,
      hasMore: Boolean(response?.comments?.pageInfo?.hasNextPage),
    };
  },
};