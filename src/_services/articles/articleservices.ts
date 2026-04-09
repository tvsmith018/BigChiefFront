import { graphQLClient,  httpClient} from "@/_network";
import { home_query, load_article_set, search_query, article_detail_metaData, article_detail_query, article_comment_query, article_related_query} from "@/_queries";

import { ArticleEdge, Article } from "@/_types/articles/article.types";
import { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { unstable_cache } from "next/cache";

interface ArticleReturn {
  articles:{
    edges:[{
      node:Article
    }],
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
    const data = await graphQLClient.query<ArticleEdge>(home_query, undefined, {cache:"force-cache", next:{revalidate:60}});
    return data;
  }

  static async getArticle(category?:string, after?:string, ) {
    const data = await graphQLClient.query<ArticleReturn>(load_article_set(after, category), undefined, {cache:"no-store"})
    return data
  }

  static async fetchSearch(value:string):Promise<[{ node: Article; }]> {
    const data = await graphQLClient.query<ArticleReturn>(search_query(value), undefined, {cache:"no-store"})
    return data.articles.edges
  }

  static fetchDetailsMeta = unstable_cache(
    async (id:string)=>{
      const data = await graphQLClient.query<GraphQLArticleResponse>(article_detail_metaData(id));
      return data.articles.edges[0].node ?? null
    },
    ["article-metadata"],
    { revalidate: 1, tags:["article-metadata"]}
  )
  
  static fetchDetailsBundle = async (id:string) => {
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
  }

  static canRate = async (token:JWTToken, articleId:string)=>{
    const hasRating = await httpClient.request<RatingResponse>(
      `/articles/rating/${articleId}/`,
      {
        method:"GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
      },
      {cache:"no-store"}
    )
    return hasRating
  }

  static submitRate = async (token:JWTToken, articleId:string, rate:number) => {
    
    const setRating = await httpClient.request<SetRatingResponse>(
      `/articles/rating/${articleId}/set/`,
      {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
        body: {rate: rate}
      },
      {cache:"no-store"}
    )

    return setRating
  }

  static fetchMore = async (category: string, id:string, first:number, after:string) => {
    const res = await graphQLClient.query<GraphQLRelatedArticleResponse>(article_related_query(category,id,first,after));
    return res
  }

  static fetchMoreComments = async (id:string, after?:string) => {
    const data = await graphQLClient.query<GraphQLCommentsResponse>(article_comment_query(id,10,after))
    return data
  }
}
