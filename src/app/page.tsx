import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { ArticleService } from "@/_services/articles/articleservices";
import { Suspense } from "react";

const CarouselView = dynamic(async ()=>import('@/_views/Home/Carousel/ArticleSlidesView'));
const HeaderView = dynamic(async ()=>import('@/_views/Home/Hero/HeaderSection'));
const CardListView = dynamic(async ()=>import('@/_views/Home/CardList/cardlistview'));

export const metadata: Metadata = {
  title: "Welcome to Big Chief Ent",
  description:"This is the Home page to Big Chief Ent.  Big Chief Ent is a hip-hop blog site based out of Raleigh NC. We have content from people all over so feel free to check us out.  Thank you and welcome.",
}


async function HomeDataLoader() {
  const data = await ArticleService.fetchHomePage();

  const slides = data.slide!.edges;
  const featured = data.main!.edges[0];
  const secondary = data.side!.edges;
  const list = data.list!.edges;
  const list_page_info = data.list!.pageInfo;

  return (
    <>
      <Suspense fallback={<div className="skeleton-carousel" />}>
        <CarouselView articles={slides} />
      </Suspense>

      <Suspense fallback={<div className="skeleton-hero" />}>
        <HeaderView featured={featured} secondary={secondary} />
      </Suspense>

      <Suspense fallback={<div className="skeleton-list" />}>
        <CardListView list={list} title="All Articles" pageInfo={list_page_info}/>
      </Suspense>
    </>
  );
}

export default async function Page() {

  return <main style={{ overflowX: "hidden" }}>
    
      <Suspense fallback={<div className="page-skeleton" />}>
        <HomeDataLoader />
      </Suspense>
    </main>
}
