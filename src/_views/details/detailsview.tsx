"use client"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Nav from 'react-bootstrap/Nav';
import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Link from "next/link"
import { DateFormatter } from '../../../_utilities/dateformatter/dateformatter';
import { articlesRetrieve } from '../CardList/actions/articlesAction';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import { useSelector } from 'react-redux';
import { getUserID } from '../../../_utilities/network/Authorization/sessions/session';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { TooltipProps } from 'react-bootstrap/Tooltip';

type DetailTabs = "comment" | "stat" | "author" | "related" | "article"


interface Author {
    firstname:string,
    lastname:string,
    avatarUrl:string,
    bio:string,
    dob:string
}

interface RelatedInt{
    node: {
        image4x3Url?: string,
        altImage?: string,
        badgeColor: string,
        category: string,
        id: string,
        title:string,
        author: {
            firstname: string,
            lastname: string,
            avatarUrl?: string
        },
        created: string
    }
}

interface CommentInt{
    node: {
        user: {
            firstname:string,
            lastname:string,
            avatarUrl?:string
        },
        body:string,
        created:string
    }
}

const DetailView = ({briefsummary, author, body, related,category, articleId, comments}:{briefsummary:string, author:Author, body:string, related:Array<RelatedInt>, category:string, articleId:string, comments:Array<CommentInt>}) =>{
    const [articleCollapse, setArticleCollapse] = useState("....Read More");
    const [tab, setTab] = useState<DetailTabs>("comment");
    const [relatedArticlesList, setrelatedArticlesList] = useState(related)
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(5);
    const [hasMore, setHasMore] = useState(related.length < 12 ? false:true);
    const [socket, setSocket] = useState<ReconnectingWebSocket|null>(null);
    const [socketError, setSocketError] = useState<string|undefined>(undefined)
    const [commentState, setCommentState] = useState(comments)
    const [tabButtonStyle, setTabButtonStyle] = useState(false)
    const isAuthenticated = useSelector((state:{userReducer:{isAuthenticated:boolean}}) => state['userReducer']['isAuthenticated']);

    const briefStyle = {backgroundColor:"rgba(255, 193, 7, 0.2)", border:"solid", borderWidth: 1, borderColor:"rgba(0, 0, 0, 0.2)", borderRadius:10}

    const renderCommentTooltip = (props:TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            Comments
        </Tooltip>
    );

    const renderStatsTooltip = (props:TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            More Details
        </Tooltip>
    );

    const renderAuthorTooltip = (props:TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            Author
        </Tooltip>
    );

    const renderRelatedTooltip = (props:TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            Related
        </Tooltip>
    );

    const ArticleCollapseClick = () => {
        if (articleCollapse == "....Read More"){
            setArticleCollapse("....Read Less")
        }

        if (articleCollapse == "....Read Less"){
            setArticleCollapse("....Read More")
        }
    }

    const ref = useCallback((node:HTMLDivElement) => {
            const observer = new IntersectionObserver((entries)=>{
                const target = entries[0];
                if (target.isIntersecting && hasMore) {
                    const list = articlesRetrieve(offset, category, 12)
                    list.then(async (newArticles)=>{
                        setLoading(true)
                        setrelatedArticlesList(
                            (prevArticles) => [...prevArticles,...newArticles]
                        );
                        setOffset(prev=>prev+5);
                        if (newArticles.length < 5) {
                            setHasMore(false);
                        }
                        setLoading(false);
                    })
                }
            })
            observer.observe(node);
    
            return () => observer.disconnect()
    },[offset, hasMore, category])

    const onCommentSubmit = (e:ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSocketError(undefined)
        const user_id = getUserID(articleId);
        const formData = new FormData(e.currentTarget);
        const body = formData.get("comment");

        user_id.then((id)=>{
            socket?.send(JSON.stringify({ body:body, user_id: id, article_id:articleId }));
        })
        e.currentTarget.reset();
    }

    useEffect(() => {
    // Ensure this runs client-side only
    if (typeof window !== 'undefined') {
      const ws = new ReconnectingWebSocket(`ws://bigchiefnewz-a2e8434d1e6d.herokuapp.com/ws/articles/${articleId}/`); 
      
      ws.onopen = () => console.log('WebSocket Connected');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const temp = {
            node:{
                body:data.body,
                created:data.created,
                user:{
                    avatarUrl:data.avaterUrl,
                    firstname: data.firstname,
                    lastname: data.lastname
                }
            }
        }
        setCommentState(
            (prev) => [temp, ...prev]
        )
      };
      ws.onclose = () => console.log('WebSocket Disconnected');
      ws.onerror = (error) => setSocketError("Error with comment communication, please try again")

      setSocket(ws);

      // Cleanup function to close the socket when the component unmounts
      return () => {
        ws.close();
      };
    }
    }, [articleId])

    useEffect(() => {
        function handleResize() {
            if ( window.innerWidth < 992){
                setTabButtonStyle(true)
            }
            else{
                setTabButtonStyle(false)
            }
        }

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    return <>
        <Col className="containerDesktop">
            <div className='px-3 pt-1' style={tabButtonStyle ? briefStyle:undefined}>
                <p className="fw-semibold d-lg-none">{briefsummary}</p>
                <Nav variant={"underline"} className='justify-content-center pb-2 my-custom-tabs' defaultActiveKey={"comment"}>
                    <Nav.Item className='d-lg-none'>
                        <Nav.Link eventKey={"comment"} onClick={()=>setTab("comment")}>
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderCommentTooltip}
                            >
                                <i className="bi bi-chat-left-text-fill fs-2" ></i>
                            </OverlayTrigger>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-lg-none'>
                        <Nav.Link eventKey={"stat"} onClick={()=>setTab("stat")}>
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderStatsTooltip}
                            >
                                <i className="bi bi-graph-up fs-2"></i> 
                            </OverlayTrigger>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-lg-none'>
                        <Nav.Link eventKey={"author"} onClick={()=>setTab("author")}>
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderAuthorTooltip}
                            >
                                <i className="bi bi-person-vcard fs-2"></i> 
                            </OverlayTrigger>   
                        </Nav.Link>
                    </Nav.Item>    
                    <Nav.Item className='d-lg-none'>
                        <Nav.Link eventKey={"related"} onClick={()=>setTab("related")}>
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderRelatedTooltip}
                            >
                                <i className="bi bi-camera-video-fill fs-2"></i> 
                            </OverlayTrigger>   
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-none d-lg-block'>
                        <Nav.Link eventKey={"article"} onClick={()=>setTab("article")}>
                            Article
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-none d-lg-block'>
                        <Nav.Link eventKey={"author"} onClick={()=>setTab("author")}>
                            Author
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-none d-lg-block'>
                        <Nav.Link eventKey={"related"} onClick={()=>setTab("related")}>
                            Related
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='d-none d-lg-block'>
                        <Nav.Link eventKey={"comment"} onClick={()=>setTab("comment")}>
                            Comments
                        </Nav.Link>
                    </Nav.Item>  
                </Nav>
            </div>
             {tab == "author" && <div className='mt-3'>
                <Image className='rounded-circle d-block mx-auto' src={author.avatarUrl} alt={`Image of ${author.firstname} ${author.lastname}`} width={150} height={150}/>
                <p className='mt-3'>{author.bio}</p>
            </div>}
            {tab == "stat" && <div className='mt-3'>
                <div className='d-flex justify-content-around fs-6'>
                    <div className='text-center mt-2'>
                        <i className="bi bi-eye-fill"></i>
                        <div>N/A Views</div>
                    </div>
                    <div className="vr" style={{height:80, width:2, backgroundColor:"black", opacity:1}}></div>
                    <div className='text-center mt-2'>
                        <i className="bi bi-star-fill"></i>
                        <div>N/A Stars</div>
                    </div>
                    <div className="vr border-5" style={{height:80, width:2, backgroundColor:"black", opacity:1}}></div>
                    <div className='text-center mt-2'>
                        <i className="bi bi-arrow-right"></i>
                        <div>Neutrel</div>
                    </div>
                </div>
                <div className='border rounded px-3 pt-1 mt-3 mb-1' style={{backgroundColor:"rgba(136, 105, 12, 0.2)"}}>
                    <p>{articleCollapse == "....Read More" ? body.substring(0, 200):body}&nbsp;&nbsp;<span onClick={ArticleCollapseClick}><strong>{articleCollapse}</strong></span></p>
                </div>
            </div>}
            {tab == "related" && <>
                <div className='mt-3'>
                    <Row className='g-4 mb-2'>
                        {relatedArticlesList.length == 0 && <div>Nothing here yet, we have more soon.</div>}
                        {relatedArticlesList.map((articleNode: RelatedInt, index)=>{
                            const article = articleNode.node;
                            return <Col xs={12} key={index}>
                                <Card>
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
                        })}
                        {loading && <p className="mt-3 mb-0">Loading...</p>}
                    </Row>
                </div>
                <div ref={ref}></div>
            </>}
            {tab == "comment" && <div className='mt-3 '>
                {isAuthenticated && <div className='px-3 pt-3 pb-2 rounded' style={{background:"#f8f9fa",boxShadow:"0 2px 2px rgba(0, 0, 0, 0.1)",}}>
                    <Form onSubmit={onCommentSubmit}>
                        {socketError && <div className='mb-2' style={{color:"red"}}>{socketError}</div>}
                        <Form.Control name={"comment"} as="textarea" rows={3} placeholder="Write a comment..."/>
                        <div className='d-flex justify-content-end'>
                            <Button type='submit' className="text-end p-0" style={{backgroundColor: "#f8f9fa", color:"black", borderColor:"#f8f9fa"}}>
                                <i className="bi bi-postcard" style={{fontSize:30}}></i>
                            </Button>
                        </div>
                    </Form>
                </div>}
                <div className='px-3 pt-3 pb-2 mb-3 rounded mt-3' style={{background:"#f8f9fa",boxShadow:"0 2px 2px rgba(0, 0, 0, 0.1)", height:"700px", overflowX:"hidden", overflowY:"scroll"}}>
                    <div className="comments-list">
                        {
                            commentState.length == 0 && <p>Be the first to write a comment.</p>
                        }
                        {
                            commentState.length != 0 && commentState.map((comment:any, index)=>{
                                comment = comment.node;
                                return <div className={`comment-box ${index >0 && "mt-2"}`} key={index} >
                                    <Row className='g-0'>
                                        <Col xs={2}>
                                            {comment.user.avatarUrl ? <Image className='rounded-circle' src={comment.user.avatarUrl} alt={`Image of ${comment.user.firstname} ${comment.user.lastname}`} width={40} height={40}/>:<i className="bi bi-person-circle" style={{fontSize:"20px"}}></i>}
                                        </Col>
                                        <Col xs={10}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">{comment.user.firstname} {comment.user.lastname}</h6>
                                                <span className="comment-time"><DateFormatter created={comment.created ?? ""}/></span>
                                            </div>
                                            <p className="mb-2">{comment.body}</p>
                                            <div className="comment-actions d-none">
                                                <Button style={{backgroundColor: "white", borderColor:"white"}}><i className="bi bi-heart"></i> Like</Button>
                                                <Button style={{backgroundColor: "white", borderColor:"white"}}><i className="bi bi-reply"></i> Reply</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>}
            {tab == "article" && <div className='border rounded px-3 pt-1 mt-3 mb-1' style={{backgroundColor:"rgba(136, 105, 12, 0.2)"}}>
                <p>{articleCollapse == "....Read More" ? body.substring(0, 200):body}&nbsp;&nbsp;<span onClick={ArticleCollapseClick}><strong>{articleCollapse}</strong></span></p>
            </div>}
        </Col>
    </>
}

export default DetailView