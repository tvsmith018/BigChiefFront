import { unstable_cache } from 'next/cache';
import { requestBody } from "../../../../../_utilities/network/requestBody";
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import videostyle from "./videocss.module.css"
import Image from 'next/image';
import Link from 'next/link';
import { ArticleType } from '../../../../../_utilities/datatype/types';
import { HTMLAttributeReferrerPolicy } from 'react';

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
    cloudinary: {

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
    },
    cloudinary:{

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

        const relatedData = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query:requestBody([{orderBy:`"-created"`},{category:`"${article.category}"`}, {exempt:`["${article.title}"]`}, {typefield:"$field"},{first:5}], ["image1x1Url","title","id", "altImage"], [{"$field":"String"}]),
                variables:{
                    "field": "title__in"
                }
            })
        });

        const relatedRaw = await relatedData.json();
        const relatedList = relatedRaw.data.allArticles.edges;

        return [article, relatedList]
    },
    ["article", "relatedList"],
    {revalidate: 1, tags: ["article", "relatedList"]}
)

export default async function Detail({params}:{params:Params}) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    const data = await detailedContent(decodeId);
    const article = data[0];
    const related = data[1];
    return <main>
        <section>
            <Container className="position-relative" data-sticky-container>
                <Row style={{marginTop: "-40px"}}>
                    <Col lg={8}>
                        <a className={`badge ${article.badgeColor} mb-2`}><i className="bi bi-record-fill me-1"></i>{article.category}</a>
                        <span className="ms-2 small">Written: {pubDate(article.created)}</span>
                        <h1>{article.title}</h1>
                        <div className={`ratio ratio-16x9 overflow-hidden rounded ${videostyle.player}`}>
                            {
                                article.videoType == "youtube" && <iframe loading="eager" className="" src={`${videoType.youtube.src}${article.videoLink}`} title={`${article.title}`} allow={videoType.youtube.allow} referrerPolicy={videoType.youtube.referrerPolicy} allowFullScreen={videoType.youtube.allowFullScreen}></iframe>   
                            }
                            {
                                article.videoType == "facebook" && <iframe loading="eager" className="" src={`${videoType.facebook.src}${article.videoLink}`} title={`${article.title}`} allow={videoType.facebook.allow} allowFullScreen={videoType.facebook.allowFullScreen}></iframe>   

                            }
                        </div>
                        <h4 className='mt-4'>{article.briefsummary}</h4>
                        <p className='mt-4'>{article.body}</p>
                    </Col>
                    <Col lg={4}>
                        <div data-sticky data-margin-top="80" data-sticky-for="991">
                            <div className="bg-light rounded p-3 p-md-4">
                                <div className="d-flex mb-3">
                                    <a className="flex-shrink-0" href="#">
                                        <div className="avatar avatar-xl border border-4 border-warning rounded-circle">
                                            <Image className="avatar-img rounded-circle" src={article.author.avatarUrl} width={300} height={300} alt="avatar" />
                                        </div>
                                    </a>
                                    <div className="flex-grow-1 ms-3">
                                        <p className="mb-2 fs-5">Author: {article.author.firstname} {article.author.lastname}</p>
                                        <p >I&apos;m one of the authors at Big Chief Ent...</p>
                                    </div>
                                </div>
                                <p>{article.author.bio}</p>
                            </div>
                            <div>
                                <h5 className="mt-5 mb-3">Related Articles</h5>
                                {
                                    related.map((node:ArticleType, index:number)=>{
                                        const articleR = node.node
                                        return <div className="d-flex position-relative mb-3" key={index}>
                                                <Image 
                                                    src={articleR.image1x1Url ?? ""}
                                                    alt={articleR.altImage ?? ""}
                                                    className={"img-fluid rounded-3 me-3"}
                                                    loading={"eager"}
                                                    width={50}
                                                    height={50}
                                                    placeholder={"blur"}
                                                    blurDataURL={'/images/1x1placeholder.png'}
                                                    quality={75}
                                                />
                                                <h6><Link href={`/articles/details/${articleR.id}`} className="stretched-link">{articleR.title}</Link></h6>
                                        </div>
                                    })
                                }

                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    </main>
}