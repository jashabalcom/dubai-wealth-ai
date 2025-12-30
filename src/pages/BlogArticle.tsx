import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBlogArticle } from "@/hooks/useBlogArticles";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { ArticleCard, ArticleCardSkeleton } from "@/components/blog/ArticleCard";
import { ArrowLeft, Clock, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const categoryLabels: Record<string, string> = {
  market_trends: "Market Trends",
  developer_news: "Developer News",
  golden_visa: "Golden Visa",
  off_plan: "Off-Plan",
  regulations: "Regulations",
  lifestyle: "Lifestyle",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateArticleSchema(article: any, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image_url,
    datePublished: article.published_at,
    dateModified: article.created_at,
    author: {
      "@type": "Organization",
      name: "Dubai Wealth Hub",
      url: "https://dubaiwealthhub.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Dubai Wealth Hub",
      logo: {
        "@type": "ImageObject",
        url: "https://dubaiwealthhub.com/images/mla-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { article, relatedArticles, isLoading, error } = useBlogArticle(slug || "");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded" />
              <div className="flex gap-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
              <div className="aspect-[16/9] bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-4/6 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Article Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Dubai Wealth Hub Blog</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.title} />
        {article.image_url && <meta name="twitter:image" content={article.image_url} />}
        <link rel="canonical" href={currentUrl} />
        <script type="application/ld+json">
          {JSON.stringify(generateArticleSchema(article, currentUrl))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <article className="container mx-auto px-4 max-w-4xl">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: article.title }
              ]}
              className="mb-6"
            />

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary">
                  {categoryLabels[article.category] || article.category}
                </Badge>
                {article.article_type === "featured" && (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">
                  {article.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </span>
                {article.reading_time_minutes && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {article.reading_time_minutes} min read
                  </span>
                )}
                {article.source_name && (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Source: {article.source_name}
                  </a>
                )}
              </div>

              <ShareButtons
                url={currentUrl}
                title={article.title}
                description={article.excerpt || ""}
              />
            </header>

            {/* Featured Image */}
            {article.image_url && (
              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              {article.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article.content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  Full article content is available at the source.
                </p>
              )}
            </div>

            {/* Share Footer */}
            <div className="border-t border-border pt-8 mb-12">
              <p className="text-sm text-muted-foreground mb-4">
                Found this helpful? Share it with your network.
              </p>
              <ShareButtons
                url={currentUrl}
                title={article.title}
                description={article.excerpt || ""}
              />
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <ArticleCard key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>

        <ScrollToTopButton />
        <Footer />
      </div>
    </>
  );
};

export default BlogArticle;
