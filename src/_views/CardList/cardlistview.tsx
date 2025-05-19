"use client"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Nav from "react-bootstrap/Nav"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { DateFormatter } from "../../../_utilities/dateformatter/dateformatter"
import { articlesRetrieve } from "./actions/articlesAction"
import { ArticleType } from "../../../_utilities/datatype/types"
import Script from "next/script";



export default function CardListView({list, title, category}:{list:ArticleType[], title:string, category:string}) {
    const [isClient, setIsClient] = useState(false);
    const [articleList, setArticleList] = useState(list);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(12);
    const [hasMore, setHasMore] = useState(list.length < 12 ? false:true);

    const ref = useCallback((node:HTMLDivElement) => {
        const observer = new IntersectionObserver((entries)=>{
            const target = entries[0];
            if (target.isIntersecting && hasMore) {
                const list = articlesRetrieve(offset, category)
                list.then(async (newArticles:ArticleType[])=>{
                    setLoading(true)
                    setArticleList(
                        (prevArticles:ArticleType[]) => [...prevArticles,...newArticles]
                    );
                    setOffset(prev=>prev+12);
                    if (newArticles.length < 12) {
                        setHasMore(false);
                    }
                    setLoading(false);
                })
            }
        })
        observer.observe(node);

        return () => observer.disconnect()
    },[offset, hasMore, category]) 

    useEffect(()=>{
        setIsClient(true);
    },[isClient]);
        
    return isClient && <section className="position-relative pt-0 pb-3">
        <Container>
            <h3 className="mb-4">{title}</h3>
            <Row className='g-4 mb-2'>
                {
                    articleList.map((node:ArticleType, index:number)=>{
                        
                        const article = node["node"];
                        return <Col sm={6} lg={4} key={index}>
                            <Card key={index}>
                                <Row className="g-0">
                                    <Col xs={12}>
                                        <div className="ratio ratio-16x9">
                                            <Image 
                                                src={article.image4x3Url ?? ""}
                                                alt={article.altImage ?? ""}
                                                className="card-img"
                                                loading="eager"
                                                width={1000}
                                                height={750}
                                                placeholder="blur"
                                                blurDataURL="/images/4x3placeholder.png"
                                                quality={75}                                        
                                            />
                                        </div>
                                    </Col>
                                    <Col className="mt-2">
                                        <a className={`badge ${article.badgeColor} mb-2`}><i className="bi bi-record-fill me-1"></i>{article.category}</a>
                                        <h5>
                                            <Link href={`/articles/details/${article.id}`} className="btn-link stretched-link text-reset fw-bold">
                                                {article.title}
                                            </Link>
                                        </h5>
                                        <Nav as={"ul"} className='nav-divider align-items-center fs-6 small'>
                                            <Nav.Item as={"li"}>
                                                <Nav.Link as="div">
                                                    <div className="d-flex align-items-center position-relative">
                                                        <div className="avatar avatar-sm">
                                                            <Image 
                                                                src={article.author?.avatarUrl ?? ""}
                                                                alt={`Picture of ${article.author?.firstname} ${article.author?.lastname}`}
                                                                className="avatar-img rounded-circle" 
                                                                loading="eager"
                                                                width={100}
                                                                height={100}
                                                                placeholder="blur"
                                                                blurDataURL="/images/1x1placeholder.png"
                                                                quality={75}
                                                            />

                                                        </div>
                                                        <span className="ms-2">by <a className="stretched-link btn-link">{article.author?.firstname} {article.author?.lastname}</a></span>
                                                    </div>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as={"li"}>
                                                <DateFormatter created={article.created ?? ""}/>
                                            </Nav.Item>

                                        </Nav>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    })
                }
                {loading && <p className="mt-3 mb-0">Loading...</p>}
            </Row>
            <div ref={ref}></div>
        </Container>
    </section>
}