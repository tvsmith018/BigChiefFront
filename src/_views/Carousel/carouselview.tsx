"use client"
import { useState, useEffect} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from "next/link";

import Card from 'react-bootstrap/Card'
import { DateFormatter } from "../../../_utilities/dateformatter/dateformatter";
import { ArticleType } from "../../../_utilities/datatype/types";

const CarouselView = ({articles}: {articles: ArticleType[]}) => {
    const [isClient, setIsClient] = useState(false);
    const [numSlides, setNumSlides] = useState(0);

    useEffect(()=>{
        setIsClient(true);
    },[isClient]);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 576) {
                setNumSlides(1);
            }
            else if (window.innerWidth >= 576 && window.innerWidth < 992){
                setNumSlides(2);
            }
            else{
                setNumSlides(3);
            }
        }

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [])
    
    return isClient && <section className="py-1 card-grid">
        <Container>
          <h3 className="mb-3">Featured</h3>
          <Row className="py-2">
            <Col>
                <Swiper
                    slidesPerView={numSlides}
                    spaceBetween={20}
                    loop={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay]}
                > 
                {articles.map((node:ArticleType, index:number)=>{
                    const article = node.node;
                    return (
                        <SwiperSlide key={index}>
                            <Card>
                                <Row className="g-2">
                                    <Col xs={3}>
                                        <Image 
                                            src={article?.image1x1Url ?? ""}
                                            alt={article?.altImage ?? ""}
                                            className={"img-fluid rounded-3"}
                                            loading={"eager"}
                                            width={100}
                                            height={100}
                                            sizes={"100vw"}
                                            placeholder={"blur"}
                                            blurDataURL={'/images/1x1placeholder.png'}
                                            onError={(e) => {return <Image src="/images/1x1placeholder.png" alt={`${e}`} width={100} height={100} sizes='100vw' />}}
                                            quality={75}
                                        />
                                    </Col>
                                    <Col xs={9} className="mt-2">
                                        <h5>
                                            <Link href={`/articles/details/${article.id}`} className="btn-link stretched-link text-reset fw-bold">
                                                {article.title}
                                            </Link>
                                        </h5>
                                        <Nav as={"ul"} className="nav-divider align-items-center small">
                                            <Nav.Item as={"li"}>
                                                <div className={`d-flex align-items-center position-relative`}>
                                                    <span className="ms-0">by <a className={`stretched-link btn-link`}>{article.author?.firstname} {article.author?.lastname}</a></span>
                                                </div>
                                            </Nav.Item>
                                            <Nav.Item as={"li"}>
                                                <DateFormatter created={article.created ?? ""}/>
                                            </Nav.Item>
                                        </Nav>

                                    </Col>
                                </Row>
                            </Card>
                        </SwiperSlide>
                    )
                })}

                </Swiper>
            </Col>
          </Row>
        </Container>
    </section>
}

export default CarouselView