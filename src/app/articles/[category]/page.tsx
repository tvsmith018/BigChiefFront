import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import { requestBody } from '../../../../_utilities/network/requestBody';

const DynamicList = dynamic(async ()=>import('@/_views/CardList/cardlistview'))

const getList = unstable_cache(
    async (category:string) =>{
        const params:object[] = [{orderBy:`"-created"`},{offset:0},{first:12}]
        const legs = ["id","title","image4x3Url","category","badgeColor", "altImage", "created", {author:["firstname","lastname","avatarUrl"]}]
        const vari = [{"$field":"String"}]

        let body:object;

        if (category == "featured"){
            params.push({typefield:"$field"});
            params.push({exempt:`["none"]`});

            body = {
                query: requestBody(params,legs,vari),
                variables:{
                    "field": "featuredType__in"
                }
            }
        }
        else{
            params.push({category:`"${category}"`});
            body = {
                query: requestBody(params,legs)
            }
        }

        const dataRaw = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "",{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify(body)
        });

        const data = await dataRaw.json()
        return data.data
    },
    ["dataRaw"],
    {revalidate: 1, tags: ["dataRaw"]}
)


export default async function Category({params}:{params:{category:string}}){
    const { category} = await params;
    const rawData = await getList(category);
    const articles = rawData.allArticles.edges

    return <main style={{overflowX: "hidden"}}>
        <DynamicList list={articles} title={category} category={category}/>
    </main>
}