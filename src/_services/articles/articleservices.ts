import { graphQLClient,  httpClient} from "@/_network";
import { API_BASE_URL } from "@/_network/config/endpoints";
import {
  home_query,
  load_article_set,
  search_query,
  navigation_search_query,
  article_detail_metaData,
  article_detail_query,
  article_comment_query,
  article_related_query,
} from "@/_queries";

import { ArticleEdge, Article } from "@/_types/articles/article.types";
import { logInfo, logWarn } from "@/_utilities/observability/logger";
import { unstable_cache } from "next/cache";

interface ArticleReturn {
  articles:{
    edges:Array<{
      node:Article
    }>,
    pageInfo:{
      hasNextPage:boolean,
      endCursor: string
    }
  }
}

type NavigationSearchUser = {
  id: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
};

interface NavigationUsersConnection {
  edges: Array<{ node: NavigationSearchUser }>;
}

interface GraphQLNavigationSearchResponse {
  articles: {
    edges: Array<{
      node: Article;
    }>;
  };
  usersByFirstname: NavigationUsersConnection;
  usersByLastname: NavigationUsersConnection;
  usersByEmail: NavigationUsersConnection;
}

export interface NavigationSearchResult {
  articles: Array<{ node: Article }>;
  profiles: NavigationSearchUser[];
}

interface Author {
  firstname: string;
  lastname: string;
  avatarUrl?: string;
  bio?: string;
  dob?: string;
}

type RatingResponse = {
  success: boolean;
  data: {
    has_rated: boolean;
  };
};

type SetRatingResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

export interface ArticleDetail {
  id: string;
  title: string;
  briefsummary: string;
  category: string;
  created: string;
  badgeColor: string;
  body: string;
  videoLink?: string;
  videoType?: "youtube" | "facebook";
  author: Author;
}
export interface ArticleComment {
  node: {
    body: string;
    created: string;
    user: {
      firstname: string;
      lastname: string;
      avatarUrl?: string;
    };
  };
}

export interface RelatedArticle {
  node: {
    id: string;
    title: string;
    image4x3Url?: string;
    altImage?: string;
    category: string;
    badgeColor: string;
    created: string;
    author: {
      firstname: string;
      lastname: string;
      avatarUrl?: string;
    };
  };
}

interface GraphQLArticleResponse {
  articles: {
    edges: Array<{
      node: ArticleDetail;
    }>;
  };
}

interface GraphQLRelatedArticleResponse {
  categoryArticles: {
    edges: Array<{
      node: ArticleDetail;
    }>;
    pageInfo:{
      hasNextPage:boolean,
      endCursor: string
    }
  };
}

interface GraphQLCommentsResponse {
  comments: {
    edges: ArticleComment[];
    pageInfo:{
      hasNextPage:boolean,
      endCursor: string
    };
  };
}

export class ArticleService {
  private static hasHomeContent(data: ArticleEdge | null | undefined) {
    const slideCount = data?.slide?.edges?.length ?? 0;
    const mainCount = data?.main?.edges?.length ?? 0;
    const sideCount = data?.side?.edges?.length ?? 0;
    const listCount = data?.list?.edges?.length ?? 0;
    return slideCount > 0 || mainCount > 0 || sideCount > 0 || listCount > 0;
  }

  private static async fetchHomePageUpstreamFallback() {
    const response = await fetch(`${API_BASE_URL}/graphql/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: home_query }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`home_upstream_status_${response.status}`);
    }

    const payload = (await response.json()) as { data?: ArticleEdge };
    return payload.data;
  }

  static async fetchHomePage():Promise<ArticleEdge> {
    try {
      const data = await graphQLClient.query<ArticleEdge>(
        home_query,
        undefined,
        {cache:"force-cache", next:{revalidate:60}}
      );

      if (ArticleService.hasHomeContent(data)) {
        return data;
      }
    } catch (error: unknown) {
      logWarn("article_home_fetch_cached_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const retry = await graphQLClient.query<ArticleEdge>(
        home_query,
        undefined,
        { cache: "no-store" }
      );
      if (ArticleService.hasHomeContent(retry)) {
        logInfo("article_home_fetch_recovered_uncached");
        return retry;
      }
    } catch (error: unknown) {
      logWarn("article_home_fetch_uncached_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const upstreamData = await ArticleService.fetchHomePageUpstreamFallback();
      if (ArticleService.hasHomeContent(upstreamData)) {
        logInfo("article_home_fetch_recovered_upstream_fallback");
        return upstreamData as ArticleEdge;
      }
    } catch (error: unknown) {
      logWarn("article_home_fetch_upstream_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logWarn("article_home_fetch_empty_after_retries");
    return {} as ArticleEdge;
  }

  static async getArticle(category?:string, after?:string, ) {
    try {
      const data = await graphQLClient.query<ArticleReturn>(load_article_set(after, category), undefined, {cache:"no-store"})
      return data
    } catch {
      logWarn("article_list_fetch_failed", { category, hasCursor: Boolean(after) });
      return {
        articles: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      };
    }
  }

  static async fetchSearch(value:string):Promise<Array<{ node: Article }>> {
    try {
      const data = await graphQLClient.query<ArticleReturn>(search_query(value), undefined, {cache:"no-store"})
      return data.articles.edges;
    } catch {
      logWarn("article_search_fetch_failed");
      return [];
    }
  }

  static async fetchNavigationSearch(value: string): Promise<NavigationSearchResult> {
    try {
      const data = await graphQLClient.query<GraphQLNavigationSearchResponse>(
        navigation_search_query,
        { q: value, first: 5 },
        { cache: "no-store" }
      );

      const mergedUsers = [
        ...(data.usersByFirstname?.edges ?? []),
        ...(data.usersByLastname?.edges ?? []),
        ...(data.usersByEmail?.edges ?? []),
      ]
        .map((entry) => entry.node)
        .filter((user): user is NavigationSearchUser => Boolean(user?.id));

      const uniqueProfiles = Array.from(
        new Map(mergedUsers.map((user) => [user.id, user])).values()
      );

      return {
        articles: (data.articles?.edges ?? []).slice(0, 5),
        profiles: uniqueProfiles.slice(0, 5),
      };
    } catch {
      logWarn("navigation_search_fetch_failed");
      return {
        articles: [],
        profiles: [],
      };
    }
  }

  static readonly fetchDetailsMeta = unstable_cache(
    async (id:string)=>{
      try {
        const data = await graphQLClient.query<GraphQLArticleResponse>(article_detail_metaData(id));
        return data.articles.edges[0]?.node ?? null
      } catch {
        logWarn("article_detail_metadata_fetch_failed", { articleId: id });
        return null;
      }
    },
    ["article-metadata"],
    { revalidate: 1, tags:["article-metadata"]}
  )
  
  static readonly fetchDetailsBundle = async (id:string) => {
    try {
      const articleData = await graphQLClient.query<GraphQLArticleResponse>(
        article_detail_query(id),
        undefined,
        { cache: "no-store" }
      );
      const article = articleData.articles.edges[0]?.node ?? null;

      if(!article) return null

      let commentData: GraphQLCommentsResponse = {
        comments: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      };
      let relatedData: GraphQLRelatedArticleResponse = {
        categoryArticles: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      };

      try {
        const comments = await graphQLClient.query<GraphQLCommentsResponse>(
          article_comment_query(id,10),
          undefined,
          { cache: "no-store" }
        );
        commentData = comments;
      } catch {
        logWarn("article_detail_comments_fetch_failed", { articleId: id });
      }

      try {
        const related = await graphQLClient.query<GraphQLRelatedArticleResponse>(
          article_related_query(article.category,id),
          undefined,
          { cache: "no-store" }
        );
        relatedData = related;
      } catch {
        logWarn("article_detail_related_fetch_failed", {
          articleId: id,
          category: article.category,
        });
      }

      const related = (relatedData.categoryArticles.edges ?? []).filter(
        (item) => item.node.title != article.title
      )
      const relatedPageInfo = relatedData.categoryArticles.pageInfo

      return {
        article,
        comments: commentData,
        related,
        relatedPageInfo
      }
    } catch {
      logWarn("article_detail_bundle_fetch_failed", { articleId: id });
      return null;
    }
  }

  static readonly canRate = async (articleId:string)=>{
    const hasRating = await httpClient.request<RatingResponse>(
      `/articles/rating/${articleId}/`,
      {
        method:"GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      {cache:"no-store"}
    )
    return hasRating
  }

  static readonly submitRate = async (articleId:string, rate:number) => {
    
    const setRating = await httpClient.request<SetRatingResponse>(
      `/articles/rating/${articleId}/set/`,
      {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {rate: rate}
      },
      {cache:"no-store"}
    )

    return setRating
  }

  static readonly fetchMore = async (category: string, id:string, first:number, after:string) => {
    try {
      const res = await graphQLClient.query<GraphQLRelatedArticleResponse>(article_related_query(category,id,first,after));
      return res
    } catch {
      logWarn("article_related_fetch_more_failed", { category, articleId: id });
      return {
        categoryArticles: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      };
    }
  }

  static readonly fetchMoreComments = async (id:string, after?:string) => {
    try {
      const data = await graphQLClient.query<GraphQLCommentsResponse>(article_comment_query(id,10,after))
      return data
    } catch {
      logWarn("article_comments_fetch_more_failed", { articleId: id });
      return {
        comments: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: "" },
        },
      };
    }
  }
}
