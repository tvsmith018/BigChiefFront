"use client"
import { useState, useEffect} from "react";
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from 'react-bootstrap/Card'
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import Image from "next/image";
import { DateFormatter } from "../../../_utilities/dateformatter/dateformatter";

const Main = ({main}:{main:any}) => {
    return <Card className='card-overlay-bottom  h-400 h-lg-560 rounded-3' style={{backgroundImage:`url(${main.node.image16x9Url})`, backgroundPosition:"center left", backgroundSize:"cover"}}>
        <div className="card-img-overlay d-flex flex-column p-3 p-sm-5">
            <div className="w-100 mt-auto">
                <Col>
                    <a className={`badge ${main.node.badgeColor} mb-2`}><i className="bi bi-record-fill me-1"></i>{main.node.category}</a>
                    <h2 className="text-white display-5">
                        <Link href={`/articles/details/${main.node.id}`} className="btn-link text-reset stretched-link fw-normal">{main.node.title}</Link>
                    </h2>
                    <p className="text-white">{main.node.briefsummary}</p>  
                    <Nav as={"ul"} className="nav-divider align-items-center d-none d-sm-inline-block small text-white">
                        <Nav.Item as={"li"}>
                            <Nav.Link as="div">
                                <div className={`d-flex align-items-center position-relative text-white`}>
                                    <div className="avatar avatar-sm">
                                        <Image 
                                            src={main.node.author.avatarUrl}
                                            alt={`Picture of Author ${main.node.author.firstname} ${main.node.author.lastname}`}
                                            className="avatar-img rounded-circle"
                                            loading="eager"
                                            width={100}
                                            height={100}
                                            placeholder="blur" 
                                            blurDataURL="/images/1x1placeholder.png"
                                        />
                                    </div>
                                    <span className="ms-2">by <a className={`stretched-link text-white btn-link`}>{main.node.author.firstname} {main.node.author.lastname}</a></span>
                                </div>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as={"li"}>
                            <DateFormatter created={main.node.created}/>
                        </Nav.Item>
                    </Nav>
                </Col>
            </div>
        </div>
    </Card>
}
const Side = ({sides}:{sides:any}) => {
    return <>
        {
            sides.map((node:any, index:number)=>{
                const article = node.node;
                return <Card className="mb-3" key={index}> 
                    <Row className="g-3 mb-3">
                        <Col xs={4}>
                            <Image 
                                src={article.image4x3Url}
                                alt={article.altImage}
                                className="rounded-3"
                                loading="eager"
                                width={1000}
                                height={750}
                                sizes="100vw"
                                placeholder="blur"
                                blurDataURL="/images/4x3placeholder.png"
                                onError={async (e:any) => { return <Image src="/images/1x1placeholder.png" alt={`${e}`} width={100} height={100} sizes='100vw' />}}
                                quality={75}
                            />
                        </Col>
                        <Col xs={8}>
                            <a className={`badge ${article.badgeColor} mb-2`}><i className="bi bi-record-fill me-1"></i>{article.category}</a>
                            <h5>
                                <Link href={`/articles/details/${article.id}`} className="btn-link stretched-link text-reset fw-bold">
                                    {article.title}
                                </Link>
                            </h5>
                            <Nav as={"ul"} className="nav-divider align-items-center d-none d-sm-inline-block small">
                                <Nav.Item as={"li"}>
                                    <Nav.Link as="div">
                                        <div className="d-flex align-items-center position-relative">
                                            <div className="avatar avatar-sm">
                                                <Image 
                                                    src={article.author.avatarUrl}
                                                    alt={`Picture of Author ${article.author.firstname} ${article.author.lastname}`}
                                                    className="avatar-img rounded-circle"
                                                    loading="eager"
                                                    width={100}
                                                    height={100}
                                                    placeholder="blur" 
                                                    blurDataURL="/images/1x1placeholder.png"
                                                />
                                            </div>
                                            <span className="ms-2">by <a className="stretched-linkbtn-link">{article.author.firstname} {article.author.lastname}</a></span>
                                        </div>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item as={"li"}>
                                    <DateFormatter created={article.created}/>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                </Card>
            })
        }
    </>
}

const HeaderView = ({main, sides}:{main:any, sides:any}) => { 
    const [isClient, setIsClient] = useState(false);

    useEffect(()=>{
        setIsClient(true);
    },[isClient]);
    return isClient && <section className="pt-4 pb-2"> 
        <Container>
            <Row>
                <Col lg={7}>
                    <Main main={main}/>
                </Col>
                <Col lg={5} className="mt-4 mt-lg-0">
                    <Side sides={sides}/>
                </Col>
            </Row>
        </Container>
    </section>
}

export default HeaderView