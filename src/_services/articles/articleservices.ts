import { graphQLClient,  httpClient} from "@/_network";
import { home_query, load_article_set, search_query, article_detail_metaData, article_detail_query, article_comment_query, article_related_query} from "@/_queries";

import { ArticleEdge, Article } from "@/_types/articles/article.types";
import { logWarn } from "@/_utilities/observability/logger";
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
  static async fetchHomePage():Promise<ArticleEdge> {
    try {
      const data = await graphQLClient.query<ArticleEdge>(home_query, undefined, {cache:"force-cache", next:{revalidate:60}});
      return data;
    } catch {
      logWarn("article_home_fetch_failed");
      return {} as ArticleEdge;
    }
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

  static fetchDetailsMeta = unstable_cache(
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
  
  static fetchDetailsBundle = async (id:string) => {
    try {
      const articleData = await graphQLClient.query<GraphQLArticleResponse>(
        article_detail_query(id),
        undefined,
        { cache: "no-store" }
      );
      const article = articleData.articles.edges[0]?.node ?? null;

      if(!article) return null

      const [commentData, relatedData] = await Promise.all([
        graphQLClient.query<GraphQLCommentsResponse>(
          article_comment_query(id,10),
          undefined,
          { cache: "no-store" }
        ),
        graphQLClient.query<GraphQLRelatedArticleResponse>(
          article_related_query(article.category,id),
          undefined,
          { cache: "no-store" }
        )
      ])

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

  static canRate = async (articleId:string)=>{
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

  static submitRate = async (articleId:string, rate:number) => {
    
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

  static fetchMore = async (category: string, id:string, first:number, after:string) => {
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

  static fetchMoreComments = async (id:string, after?:string) => {
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
