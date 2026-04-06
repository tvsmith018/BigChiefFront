import { notFound } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ArticleService } from '@/_services/articles/articleservices';
import ArticleRatingView from "@/_views/details/ArticleRatingView";
import ArticleDetailSidebar from "@/_views/details/ArticleDetailSidebar";
import VideoView from "@/_views/details/ArticleVideo";


type PageParams = Promise<{id:string}>

function formatPublishedDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function generateMetadata({params}:{params:PageParams}) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    const article = await ArticleService.fetchDetailsMeta(decodeId);
    
    if (!article){
        return {
            title:"Article Not found"
        }
    }

    return {
        title: article.title,
        description: article.briefsummary,
        keywords:[article.title, article.category, article.briefsummary]
    }
}

export default async function Page({params}:{params:PageParams}) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    
    const bundle = await ArticleService.fetchDetailsBundle(decodeId);
    if (!bundle) notFound();

    const {article, comments, related, relatedPageInfo} = bundle;
    return <main>
        <section className='p-0'>
            <Container className='p-1'>
                <Row className="px-1">
                    <Col lg={8}>
                        <VideoView videoLink={article.videoLink!} videoType={article.videoType!} title={article.title}/>
                        
                        <a className={`badge ${article.badgeColor} mt-3`}>
                            <i className="bi bi-record-fill me-1"></i>
                            {article.category}
                        </a>

                        <h1 className="mt-2 mb-0">{article.title}</h1>

                        <div className="d-flex align-items-center">
                            <p className="m-0 fs-3">{formatPublishedDate(article.created)}</p>
                            <p className="m-0 fs-3 ms-4 d-none d-lg-block">0 views</p>
                            <p className="m-0 fs-3 ms-4 d-none d-lg-block">
                                <i className="bi bi-arrow-right"></i> neutral
                            </p>
                            <div className="ms-auto">
                                <ArticleRatingView articleId={decodeId} />
                            </div>
                        </div>
                        <div
                            className="mt-3 border rounded px-3 py-2 d-none d-lg-block"
                            style={{ backgroundColor: "rgba(255, 193, 7, 0.2)" }}
                        >
                            <p className="m-0 fs-2" style={{ lineHeight: 1 }}>
                                {article.briefsummary}
                            </p>
                        </div>
                    </Col>
                    <ArticleDetailSidebar
                        articleId={decodeId}
                        briefsummary={article.briefsummary}
                        author={article.author}
                        body={article.body}
                        category={article.category}
                        related={related}
                        comments={comments.comments.edges}
                        relatedPageInfo={relatedPageInfo}
                        commentsPageInfo={comments.comments.pageInfo}
                    />
                </Row>
            </Container>
        </section>
    </main>
}
