import { useState } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { useLatestDigest } from "@/hooks/useDailyDigest";
import { ArticleCard, ArticleCardSkeleton } from "@/components/blog/ArticleCard";
import { DailyDigest, DailyDigestSkeleton } from "@/components/news/DailyDigest";
import { MarketPulseWidget } from "@/components/news/MarketPulseWidget";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { NewsCategory } from "@/hooks/useNews";

const categories: { value: NewsCategory; label: string }[] = [
  { value: "all", label: "All Articles" },
  { value: "market_trends", label: "Market Trends" },
  { value: "developer_news", label: "Developer News" },
  { value: "golden_visa", label: "Golden Visa" },
  { value: "off_plan", label: "Off-Plan" },
  { value: "regulations", label: "Regulations" },
  { value: "lifestyle", label: "Lifestyle" },
];

function generateBlogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Dubai Wealth Hub Blog",
    description: "Expert insights on Dubai real estate investment, market trends, Golden Visa updates, and property investment strategies.",
    url: "https://dubaiwealthhub.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Dubai Wealth Hub",
      logo: {
        "@type": "ImageObject",
        url: "https://dubaiwealthhub.com/images/mla-logo.png",
      },
    },
  };
}

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("all");
  const { articles, featuredArticle, isLoading } = useBlogArticles(selectedCategory);
  const { digest, isLoading: isLoadingDigest } = useLatestDigest();

  // Filter out featured article from main list
  const regularArticles = articles.filter(
    (a) => a.id !== featuredArticle?.id
  );

  return (
    <>
      <Helmet>
        <title>Blog | Dubai Real Estate Investment Insights | Dubai Wealth Hub</title>
        <meta
          name="description"
          content="Expert insights on Dubai real estate investment, market trends, Golden Visa updates, off-plan opportunities, and property investment strategies."
        />
        <meta
          name="keywords"
          content="Dubai real estate blog, Dubai property investment, Golden Visa Dubai, Dubai market trends, off-plan Dubai, Dubai property news"
        />
        <link rel="canonical" href="https://dubaiwealthhub.com/blog" />
        <meta property="og:title" content="Dubai Real Estate Investment Blog | Dubai Wealth Hub" />
        <meta
          property="og:description"
          content="Expert insights on Dubai real estate investment, market trends, and property strategies."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dubaiwealthhub.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify(generateBlogSchema())}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Blog & Market Insights
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert analysis on Dubai real estate trends, investment strategies, 
                Golden Visa updates, and opportunities for global investors.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-8">
                <ArticleCardSkeleton featured />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {!isLoading && (
              <>
                {/* Daily Digest Section */}
                {selectedCategory === "all" && (
                  <div className="mb-10">
                    {isLoadingDigest ? (
                      <DailyDigestSkeleton />
                    ) : digest ? (
                      <DailyDigest digest={digest} />
                    ) : null}
                  </div>
                )}

                {/* Featured Article */}
                {featuredArticle && selectedCategory === "all" && (
                  <div className="mb-10">
                    <ArticleCard article={featuredArticle} featured />
                  </div>
                )}

                {/* Article Grid */}
                {regularArticles.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">
                      No articles found in this category yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory("all")}
                    >
                      View All Articles
                    </Button>
                  </div>
                )}

                {/* Empty State for No Articles */}
                {articles.length === 0 && !featuredArticle && (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                      Coming Soon
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We're preparing in-depth articles and market analysis. 
                      Subscribe to be notified when new content is published.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild>
                        <Link to="/community/news">View Market News</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/community">Join Community</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
