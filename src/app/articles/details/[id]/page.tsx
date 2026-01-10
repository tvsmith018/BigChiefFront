import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import { requestBody, requestComment } from "../../../../../_utilities/network/requestBody";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { HTMLAttributeReferrerPolicy } from 'react';
import { de } from 'zod/v4/locales';

const DynamicDetailsView = dynamic(async ()=>import("@/_views/details/detailsview"));
const DynamicStarsView = dynamic(async ()=>import("@/_views/details/ratings/starratingview"))

interface VideoType {
    youtube:{
        src:string,
        allow:string,
        referrerPolicy?:HTMLAttributeReferrerPolicy,
        allowFullScreen:boolean
    }
    facebook:{
        src:string,
        allow:string,
        referrerPolicy?:HTMLAttributeReferrerPolicy,
        allowFullScreen:boolean
    }
}
const videoType:VideoType = {
    youtube:{
        src:"https://www.youtube.com/embed/",
        allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", 
        referrerPolicy:"strict-origin-when-cross-origin",
        allowFullScreen:true
    },
    facebook:{
        src:"https://www.facebook.com/plugins/",
        allow:"autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share", 
        referrerPolicy:undefined,
        allowFullScreen:true
    }
}

type Params = Promise<{ id:string }>;


function pubDate(pubDate:string){
    
    const obj = new Date(pubDate)
    const day = obj.getUTCDate();
    const month = obj.toLocaleString('default', { month: 'long' });
    const year = obj.getUTCFullYear();

    return `${month} ${day}, ${year}`
}

export async function generateMetadata({params}:{params:Params}) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    const data = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query:requestBody([{id:`"${decodeId}"`}],["briefsummary","category","title"])
        })
    })
    const articleRaw = await data.json();
    const articleData = articleRaw.data.allArticles.edges[0].node; 
    
    return {
        title: articleData.title,
        description: articleData.briefsummary,
        keywords: [articleData.title, articleData.category, articleData.briefsummary]
    }
}

const detailedContent =  unstable_cache(
    async (id:string) => {
        const data = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query:requestBody([{id:`"${id}"`}],["briefsummary","category","created","badgeColor","title","videoLink", "videoType","body",{author:["firstname","lastname","avatarUrl", "bio", "dob"]}])
            })
        })

        const articleRaw = await data.json();
        const article = articleRaw.data.allArticles.edges[0].node;

        const commentData = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/graphql/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: requestComment(id)
            })
        })

        const commentRaw = await commentData.json()
        const comments = commentRaw.data.allComments.edges

        const relatedData = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query:requestBody([{orderBy:`"-created"`},{category:`"${article.category}"`}, {exempt:`["${article.title}"]`}, {typefield:"$field"},{first:12}], ["image4x3Url","title","id", "altImage","created","category","badgeColor",{author:["firstname","lastname","avatarUrl"]}], [{"$field":"String"}]),
                variables:{
                    "field": "title__in"
                }
            })
        });

        const relatedRaw = await relatedData.json();
        const relatedList = relatedRaw.data.allArticles.edges;

        return [article, relatedList, comments]
    },
    ["article", "relatedList"],
    {revalidate: 1, tags: ["article", "relatedList"]}
)

export default async function DetailPage({params}:{params:Params}) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    const data = await detailedContent(decodeId);
    const article = data[0];
    const related = data[1];
    const comments = data[2];
    return <main>
        <section className='p-0'>
            <Container className='p-1'>
                <Row className='px-1'>
                    <Col lg={8}>
                        <div className={`ratio ratio-16x9`}>
                        {
                            article.videoType == "youtube" && <iframe loading="eager" className="p-0 m-0" src={`${videoType.youtube.src}${article.videoLink}`} title={`${article.title}`} allow={videoType.youtube.allow} referrerPolicy={videoType.youtube.referrerPolicy} allowFullScreen={videoType.youtube.allowFullScreen}></iframe>   
                        }
                        {
                            article.videoType == "facebook" && <iframe loading="eager" className="p-0 m-0" src={`${videoType.facebook.src}${article.videoLink}`} title={`${article.title}`} allow={videoType.facebook.allow} allowFullScreen={videoType.facebook.allowFullScreen}></iframe>   
                        }
                        </div>
                        <a className={`badge ${article.badgeColor} mt-3`}><i className="bi bi-record-fill me-1"></i>{article.category}</a>
                        <h1 className='mt-2 mb-0'>{article.title}</h1>
                        <div className='d-flex align-items-center'>
                            <p className='m-0 fs-3'>{pubDate(article.created)}</p>
                            <p className='m-0 fs-3 ms-4 d-none d-lg-block'>0 views</p>
                            <p className='m-0 fs-3 ms-4 d-none d-lg-block'><i className="bi bi-arrow-right"></i> neutrel</p>
                            <div className='ms-auto'>
                                <DynamicStarsView article_id={decodeId}/>
                            </div>
                        </div>
                        <div className='mt-3 border rounded px-3 py-2 d-none d-lg-block' style={{backgroundColor:"rgba(255, 193, 7, 0.2)"}}>
                            <p className='m-0 fs-2' style={{margin:0, padding:0, lineHeight:1}}>{article.briefsummary}</p>
                        </div>
                    </Col>
                    <DynamicDetailsView briefsummary={article.briefsummary} author={article.author} body={article.body} related={related} category={article.category} articleId={decodeId} comments={comments}/>
                </Row>
            </Container>
        </section>
    </main>
}