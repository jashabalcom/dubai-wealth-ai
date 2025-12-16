import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNews } from '@/hooks/useNews';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  market_trends: 'bg-blue-500/20 text-blue-400',
  developer_news: 'bg-emerald-500/20 text-emerald-400',
  golden_visa: 'bg-gold/20 text-gold',
  off_plan: 'bg-purple-500/20 text-purple-400',
  regulations: 'bg-red-500/20 text-red-400',
  lifestyle: 'bg-pink-500/20 text-pink-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  market_trends: 'Market',
  developer_news: 'Developer',
  golden_visa: 'Golden Visa',
  off_plan: 'Off-Plan',
  regulations: 'Regulations',
  lifestyle: 'Lifestyle',
};

export function NewsWidget() {
  const { articles, featuredArticle, isLoading } = useNews();

  // Get latest headlines (excluding featured)
  const headlines = articles
    .filter(a => a.article_type === 'headline' && a.id !== featuredArticle?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-gold" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no articles
  if (!featuredArticle && headlines.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-gold" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>News feed coming soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-gold" />
          Market News
        </CardTitle>
        <Link 
          to="/community/news" 
          className="text-sm text-gold hover:text-gold/80 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Link to={`/community/news?article=${featuredArticle.id}`}>
              <div className="relative rounded-xl overflow-hidden bg-muted/50 border border-border/50 hover:border-gold/30 transition-all duration-300">
                {featuredArticle.image_url && (
                  <div className="aspect-[2/1] overflow-hidden">
                    <img 
                      src={featuredArticle.image_url} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={CATEGORY_COLORS[featuredArticle.category] || 'bg-muted'}>
                      {CATEGORY_LABELS[featuredArticle.category] || featuredArticle.category}
                    </Badge>
                    <Badge variant="outline" className="text-gold border-gold/30">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
                    {featuredArticle.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-gold/50 my-2" />
                  <p className="text-sm text-muted-foreground line-clamp-2">{featuredArticle.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featuredArticle.reading_time_minutes || 3} min read
                    </span>
                    <span>
                      {featuredArticle.published_at && formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Headlines */}
        {headlines.length > 0 && (
          <div className="space-y-2">
            {headlines.map((article, index) => (
              <motion.a
                key={article.id}
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{article.source_name}</span>
                    <span>•</span>
                    <span>
                      {article.published_at && formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold shrink-0 mt-0.5" />
              </motion.a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}