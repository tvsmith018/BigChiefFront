// _types/article.ts
export interface Author {
  firstname: string;
  lastname: string;
  avatarUrl?: string;
}


export interface Article {
  id?: string;
  title?: string;
  category?: string;
  badgeColor?: string;
  created?: string;
  altImage?: string;
  briefsummary?: string;
  image1x1Url?: string;
  image4x3Url?: string;
  image16x9Url?: string;
  featuredType?: "slide" | "main" | "side" | "none";
  author?: Author;
  body?: string;
  videoLink?: string;
  videoType?: string;
}

export interface ArticleEdge {
  slide?: {
    edges: [{
      node: Article
    }]
  }
  side?: {
    edges: [{
      node: Article
    }]
  }
  main?: {
    edges: [{
      node: Article
    }]
  }
  list?: {
    edges: [{
      node: Article
    }],
    pageInfo: {
      hasNextPage: boolean,
      endCursor: string
    }
  }
}
