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

export async function generateMetadata({
  params,
}: Readonly<{ params: PageParams }>) {
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

export default async function Page({
  params,
}: Readonly<{ params: PageParams }>) {
    const { id } = await params;
    const decodeId = decodeURIComponent(id);
    
    const bundle = await ArticleService.fetchDetailsBundle(decodeId);
    if (!bundle) notFound();

    const {article, comments, related, relatedPageInfo} = bundle;
    return <main className="bc-article-detail-page">
        <section className='bc-article-detail-section'>
            <Container className='bc-article-detail-container'>
                <Row className="bc-article-detail-grid">
                    <Col lg={8} className="bc-article-detail-main">
                        <div className="bc-article-video-bleed">
                            <VideoView
                              videoLink={article.videoLink ?? ""}
                              videoType={article.videoType ?? "youtube"}
                              title={article.title}
                            />
                        </div>
                        
                        <span className={`badge ${article.badgeColor} mt-3 bc-article-detail-badge`}>
                            <i className="bi bi-record-fill me-1"></i>
                            {article.category}
                        </span>

                        <h1 className="mt-2 mb-0 bc-article-detail-title">{article.title}</h1>

                        <div className="bc-article-detail-meta">
                            <p className="m-0 bc-article-detail-meta__item">{formatPublishedDate(article.created)}</p>
                            <p className="m-0 bc-article-detail-meta__item d-none d-lg-block">0 views</p>
                            <p className="m-0 bc-article-detail-meta__item d-none d-lg-block">
                                <i className="bi bi-arrow-right"></i> neutral
                            </p>
                            <div className="bc-article-detail-meta__rating">
                                <ArticleRatingView articleId={decodeId} />
                            </div>
                        </div>
                        <div
                            className="bc-article-detail-summary d-none d-lg-block"
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
