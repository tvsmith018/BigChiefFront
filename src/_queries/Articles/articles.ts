export const HOME_PAGE_QUERY = `
  query {
    slide: articles(featuredType:"slide", orderBy:"-created"){
      edges{
        node{
          id
          title
          image1x1Url
          altImage
          created
          author {
            firstname
            lastname
          }
        }
      }
    }
    side :articles(featuredType:"side", orderBy:"-created"){
      edges{
        node{
          id
          title
          image4x3Url
          altImage
          category
          badgeColor
          created
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
    }
    main :articles(featuredType:"main"){
      edges{
        node{
          id
          title
          image16x9Url
          altImage
          briefsummary
          category
          badgeColor
          created
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
    }
    list: articles(orderBy:"-created", first:12){
  	  edges{
        cursor
    	  node{
          id
          title
          image4x3Url
          altImage
          category
          badgeColor
          created
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
      pageInfo{
        hasNextPage
        endCursor
      }       
    }
  }
`

export const LOAD_ARTICLE_SET = (after?:string, category?:string)=>(`
  query {
    articles(orderBy:"-created", first:12 ${after ? `,after:"${after}"`:``} ${category ? `,category:"${category}"`:``}){
  	  edges{
    	  node{
          id
          title
          image4x3Url
          altImage
          category
          badgeColor
          created
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
      pageInfo{
        hasNextPage
        endCursor
      }  
    }
  } 
`)

export const SEARCH_ARTICLE = (value:string)=>(
    `
        query {
            articles(search:"${value}" first:5){
  	            edges{
    	            node{
                        title
                        image1x1Url
                        altImage
                        created
                        id
                    }
                }
            }
        }
    `
)

export const NAVIGATION_SEARCH_QUERY = `
  query NavigationSearch($q: String!, $first: Int = 5) {
    articles(search: $q, first: $first) {
      edges {
        node {
          id
          title
          image1x1Url
          altImage
          created
        }
      }
    }

    usersByFirstname: users(firstname: $q, first: $first) {
      edges {
        node {
          id
          firstname
          lastname
          avatarUrl
        }
      }
    }

    usersByLastname: users(lastname: $q, first: $first) {
      edges {
        node {
          id
          firstname
          lastname
          avatarUrl
        }
      }
    }

    usersByEmail: users(email: $q, first: $first) {
      edges {
        node {
          id
          firstname
          lastname
          avatarUrl
        }
      }
    }
  }
`;

export const ARTICLE_DETAIL_QUERY = (id: string) => `
  query {
    articles(id: "${id}") {
      edges {
        node {
          id
          title
          briefsummary
          category
          created
          badgeColor
          body
          videoLink
          videoType
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
    }
  }
`;

export const ARTICLE_METADATA_QUERY = (id: string) => `
  query {
    articles(id: "${id}") {
      edges {
        node {
          title
          briefsummary
          category
        }
      }
    }
  }
`;

export const ARTICLE_COMMENTS_QUERY = (articleid: string, first: number, after?:string) => `
  query {
	  comments(orderBy: "-created", first: ${first}, article:"${articleid}", ${after ? `after:"${after}"`:``}){
      edges{
        node{
          body
          created
          user{
            firstname
            lastname
            avatarUrl
          }
        }
      }
      pageInfo{
        hasNextPage
        endCursor
      }
    }
  }
`;

export const RELATED_ARTICLES_QUERY = (category: string, articleid:string, first:number=5, after?:string) => `
  query {
    categoryArticles(category: "${category}", first: ${first}, excludeId:"${articleid}", after: "${after ?? ""}") {
      edges {
        cursor
        node {
          id
          title
          image4x3Url
          altImage
          category
          badgeColor
          created
          author {
            firstname
            lastname
            avatarUrl
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
