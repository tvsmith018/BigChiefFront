import { ArticleService } from "@/_services/articles/articleservices";
import CardListView from '@/_views/Home/CardList/cardlistview';

type tParams = Promise<{ category:string }>;

export default async function Category({params}:{params:tParams}){
    const {category} = await params;
    const data = await ArticleService.getArticle(category,undefined);
    const articles = data.articles.edges;
    const pageInfo = data.articles.pageInfo

    return <main style={{overflowX: "hidden"}}>
        <CardListView list={articles} title={category} pageInfo={pageInfo} category={category}/>
    </main>
}

