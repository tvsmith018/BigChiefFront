import dynamic from "next/dynamic";
import { unstable_cache } from 'next/cache';
import type { Metadata } from "next";
import { requestBody } from '../../_utilities/network/requestBody';
import { ArticleType } from "../../_utilities/datatype/types";

const DynamicCarousel = dynamic(async ()=>import('@/_views/Carousel/carouselview'));
const DynamicHeader = dynamic(async ()=>import('@/_views/HeaderHome/headerview'));
const DynamicList = dynamic(async ()=>import('@/_views/CardList/cardlistview'));
const DynamicAdsterraNative = dynamic(async ()=>import('@/_views/ads/adsterranative'));

async function multipleFetches(): Promise<Response[]> {
  const promises = [
    fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "",{
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query:requestBody([{orderBy:`"-created"`},{exempt:`["none","old"]`}, {typefield:"$field"}], ["image1x1Url", "image4x3Url", "image16x9Url", "title", "id", "featuredType", {author:["firstname","lastname","avatarUrl"]},"created", "altImage","briefsummary","category", "badgeColor"], [{"$field":"String"}]),
        variables:{
          "field": "featuredType__in"
        }
      }),
      cache: 'no-store'
    }),
    fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: requestBody([{orderBy:`"-created"`}, {offset:0},{first:12}],["id","title","image4x3Url","category","badgeColor", "altImage", "created",{author:["firstname","lastname","avatarUrl"]}])
      }),
      cache: 'no-store'
    })
  ];
  const results = await Promise.all(promises);
  return results
}

const getHomeData = unstable_cache(
  async ()=>{
    const data = await multipleFetches();
    const featuredData = await data[0].json();
    const articleListData = await data[1].json();
    return [featuredData.data,articleListData.data]
  },
  ['featuredData', 'articleListData'],
  {revalidate: 1, tags: ['featuredData', 'articleListData']}
)

export const metadata: Metadata = {
  title: "Welcome to Big Chief Ent",
  description:"This is the Home page to Big Chief Ent.  Big Chief Ent is a hip-hop blog site based out of Raleigh NC. We have content from people all over so feel free to check us out.  Thank you and welcome.",
}

export default async function Home() {
  const articlesData = await getHomeData();
  const featured = articlesData[0];
  const listraw = articlesData[1];

  const slides = featured.allArticles.edges.filter((article:ArticleType)=>article.node.featuredType == "slide");
  const main = featured.allArticles.edges.filter((article:ArticleType)=>article.node.featuredType == "main")[0];
  const sides = featured.allArticles.edges.filter((article:ArticleType)=>article.node.featuredType == "side");
  const list = listraw.allArticles.edges;

  return (
    <main style={{overflowX: "hidden"}}>
      <DynamicCarousel articles={slides} />
      <DynamicHeader main={main} sides={sides} />
      <DynamicAdsterraNative />
      <DynamicList list={list} title={"All Articles"} category="all"/>
    </main>
  );
}
