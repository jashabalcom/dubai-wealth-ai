import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Clock, ExternalLink, ArrowRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNews, NewsCategory, NewsArticle } from '@/hooks/useNews';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'All News' },
  { value: 'market_trends', label: 'Market Trends' },
  { value: 'developer_news', label: 'Developer News' },
  { value: 'golden_visa', label: 'Golden Visa' },
  { value: 'off_plan', label: 'Off-Plan' },
  { value: 'regulations', label: 'Regulations' },
];

const CATEGORY_COLORS: Record<string, string> = {
  market_trends: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  developer_news: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  golden_visa: 'bg-gold/20 text-gold border-gold/30',
  off_plan: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  regulations: 'bg-red-500/20 text-red-400 border-red-500/30',
  lifestyle: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  market_trends: 'Market Trends',
  developer_news: 'Developer News',
  golden_visa: 'Golden Visa',
  off_plan: 'Off-Plan',
  regulations: 'Regulations',
  lifestyle: 'Lifestyle',
};

// Placeholder image for articles without images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(220,40%,12%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(220,35%,8%);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect fill="url(#grad)" width="800" height="450"/>
  <text x="400" y="225" fill="hsl(35,25%,70%)" font-size="48" text-anchor="middle" font-family="Georgia, serif">📰</text>
</svg>
`);

function ArticleCard({ article, onSelect }: { article: NewsArticle; onSelect: (article: NewsArticle) => void }) {
  const isFeatured = article.article_type === 'featured';
  const hasContent = !!(article.content && article.content.length > 50);
  const imageUrl = article.image_url || PLACEHOLDER_IMAGE;

  if (isFeatured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-gold/30 transition-all duration-300 group cursor-pointer" onClick={() => onSelect(article)}>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
              <img 
                src={imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
              />
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className={`${CATEGORY_COLORS[article.category]} border`}>
                  {CATEGORY_LABELS[article.category] || article.category}
                </Badge>
                <Badge className="bg-gold/20 text-gold border border-gold/30">
                  Featured Analysis
                </Badge>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground group-hover:text-gold transition-colors mb-3">
                {article.title}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gold to-gold/30 mb-4" />
              <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.reading_time_minutes || 5} min read
                  </span>
                  <span>
                    {article.published_at && format(new Date(article.published_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-gold hover:text-gold hover:bg-gold/10"
                >
                  Read Analysis <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.article>
    );
  }

  // Headline card - now opens in-app
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group cursor-pointer"
        onClick={() => onSelect(article)}
      >
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="secondary" 
              className={`${CATEGORY_COLORS[article.category]} border text-xs`}
            >
              {CATEGORY_LABELS[article.category] || article.category}
            </Badge>
            {hasContent && (
              <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                Summary
              </Badge>
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>
          <div className="w-10 h-0.5 bg-gold/40 mb-3" />
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{article.source_name}</span>
            <span className="flex items-center gap-1">
              {article.published_at && formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

function ArticleDetail({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const imageUrl = article.image_url || PLACEHOLDER_IMAGE;
  const hasContent = !!(article.content && article.content.length > 50);
  const isFeatured = article.article_type === 'featured';

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="container max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1 p-0 h-auto hover:bg-transparent hover:text-gold">
            <ChevronLeft className="h-4 w-4" />
            News
          </Button>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
        </nav>
        
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 bg-muted">
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className={`${CATEGORY_COLORS[article.category]} border`}>
            {CATEGORY_LABELS[article.category] || article.category}
          </Badge>
          <Badge variant="outline">
            {isFeatured ? 'Featured Analysis' : hasContent ? 'Investment Summary' : 'News Headline'}
          </Badge>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.reading_time_minutes || 2} min read
          </span>
          <span>
            {article.published_at && format(new Date(article.published_at), 'MMMM d, yyyy')}
          </span>
          <span className="text-muted-foreground/60">
            via {article.source_name}
          </span>
        </div>

        {/* Article Content */}
        {hasContent ? (
          <article className="prose-luxury mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {(article.content || '').replace(/^#\s+.+\n+/, '')}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Read Original Article Button */}
        <div className="pt-6 border-t border-border">
          <a 
            href={article.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" className="gap-2 hover:border-gold hover:text-gold">
              Read Original Article
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            Opens in a new tab at {article.source_name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<NewsCategory>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const { articles, featuredArticle, isLoading, error } = useNews(category);

  // Combine featured (if exists) + headlines
  const displayArticles = featuredArticle 
    ? [featuredArticle, ...articles.filter(a => a.id !== featuredArticle.id)]
    : articles;

  // Handle query param for direct article linking
  useEffect(() => {
    const articleId = searchParams.get('article');
    if (articleId && displayArticles.length > 0) {
      const article = displayArticles.find(a => a.id === articleId);
      if (article) {
        setSelectedArticle(article);
      }
    }
  }, [searchParams, displayArticles]);

  // Update URL when selecting/deselecting article
  const handleSelectArticle = useCallback((article: NewsArticle | null) => {
    setSelectedArticle(article);
    if (article) {
      setSearchParams({ article: article.id });
    } else {
      searchParams.delete('article');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleCloseArticle = useCallback(() => {
    handleSelectArticle(null);
  }, [handleSelectArticle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Newspaper className="h-7 w-7 text-gold" />
            Dubai Market News
          </h1>
          <p className="text-muted-foreground mt-1">
            Investment insights curated for Dubai real estate investors
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.value)}
            className={category === cat.value 
              ? 'bg-gold text-primary-foreground hover:bg-gold/90' 
              : 'hover:border-gold/50 hover:text-gold'
            }
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="col-span-full h-64 rounded-2xl" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{error}</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayArticles.length === 0 && (
        <Card className="p-12 text-center bg-card/80">
          <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No News Available</h3>
          <p className="text-muted-foreground">
            Check back soon for the latest Dubai real estate insights
          </p>
        </Card>
      )}

      {/* Articles Grid */}
      {!isLoading && displayArticles.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {displayArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article}
              onSelect={handleSelectArticle}
            />
          ))}
        </motion.div>
      )}

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleDetail 
            article={selectedArticle} 
            onClose={handleCloseArticle} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
