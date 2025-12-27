import { Link } from "react-router-dom";
import { Clock, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle, NewsCategory } from "@/hooks/useNews";

interface ArticleCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const categoryLabels: Record<NewsCategory, string> = {
  all: "All",
  market_trends: "Market Trends",
  developer_news: "Developer News",
  golden_visa: "Golden Visa",
  off_plan: "Off-Plan",
  regulations: "Regulations",
  lifestyle: "Lifestyle",
};

const categoryColors: Record<NewsCategory, string> = {
  all: "bg-muted text-muted-foreground",
  market_trends: "bg-blue-500/10 text-blue-500",
  developer_news: "bg-purple-500/10 text-purple-500",
  golden_visa: "bg-primary/10 text-primary",
  off_plan: "bg-orange-500/10 text-orange-500",
  regulations: "bg-red-500/10 text-red-500",
  lifestyle: "bg-green-500/10 text-green-500",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateSlug(id: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `${slug}-${id.slice(0, 8)}`;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const slug = generateSlug(article.id, article.title);

  if (featured) {
    return (
      <Link
        to={`/blog/${slug}`}
        className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {article.image_url && (
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={categoryColors[article.category]}>
                {categoryLabels[article.category]}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/30">
                Featured
              </Badge>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDate(article.published_at)}</span>
              {article.reading_time_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.reading_time_minutes} min read
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-primary font-medium">
              Read article <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${slug}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
    >
      {article.image_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge className={categoryColors[article.category]}>
            {categoryLabels[article.category]}
          </Badge>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDate(article.published_at)}</span>
          {article.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time_minutes} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ArticleCardSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-[16/10] md:aspect-auto bg-muted" />
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
            <div className="h-8 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
