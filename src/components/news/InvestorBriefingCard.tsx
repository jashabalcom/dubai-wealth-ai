import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, MapPin, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NewsArticle } from '@/hooks/useNews';

interface InvestorBriefingCardProps {
  article: NewsArticle & {
    investment_rating?: number | null;
    urgency_level?: string | null;
    affected_areas?: string[] | null;
    verification_status?: string | null;
    briefing_type?: string | null;
  };
  featured?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  market_trends: 'Market Trends',
  developer_news: 'Developer News',
  golden_visa: 'Golden Visa',
  off_plan: 'Off-Plan',
  regulations: 'Regulations',
  lifestyle: 'Lifestyle',
};

const URGENCY_CONFIG: Record<string, { label: string; className: string; icon: typeof AlertTriangle }> = {
  breaking: { label: 'Breaking', className: 'bg-destructive text-destructive-foreground animate-pulse', icon: AlertTriangle },
  high: { label: 'High Priority', className: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: TrendingUp },
  normal: { label: '', className: '', icon: Clock },
  evergreen: { label: 'Evergreen', className: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: CheckCircle },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function InvestmentRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Investment Rating: ${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-3.5 h-3.5',
            star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

export function InvestorBriefingCard({ article, featured = false }: InvestorBriefingCardProps) {
  const urgencyConfig = URGENCY_CONFIG[article.urgency_level || 'normal'];
  const slug = `${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${article.id.slice(0, 8)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'group relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        featured && 'md:col-span-2 lg:col-span-3'
      )}
    >
      <Link to={`/blog/${slug}`} className="block">
        {/* Image Section */}
        <div className={cn(
          'relative overflow-hidden bg-muted',
          featured ? 'aspect-[21/9]' : 'aspect-[16/9]'
        )}>
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-primary/40" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {article.urgency_level && article.urgency_level !== 'normal' && (
              <Badge className={cn('text-xs font-medium', urgencyConfig.className)}>
                <urgencyConfig.icon className="w-3 h-3 mr-1" />
                {urgencyConfig.label}
              </Badge>
            )}
            {article.briefing_type === 'daily_digest' && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                Daily Digest
              </Badge>
            )}
          </div>
          
          {/* Verification badge */}
          {article.verification_status === 'verified' && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {CATEGORY_LABELS[article.category] || article.category}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(article.published_at)}
              </span>
            </div>
            {article.investment_rating && (
              <InvestmentRating rating={article.investment_rating} />
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors',
            featured ? 'text-xl md:text-2xl' : 'text-lg'
          )}>
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className={cn(
              'text-muted-foreground line-clamp-2',
              featured ? 'text-base' : 'text-sm'
            )}>
              {article.excerpt}
            </p>
          )}

          {/* Affected Areas */}
          {article.affected_areas && article.affected_areas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              {article.affected_areas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {area}
                </span>
              ))}
              {article.affected_areas.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{article.affected_areas.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

export function InvestorBriefingCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card overflow-hidden animate-pulse',
      featured && 'md:col-span-2 lg:col-span-3'
    )}>
      <div className={cn('bg-muted', featured ? 'aspect-[21/9]' : 'aspect-[16/9]')} />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded" />
        </div>
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-4 w-4/5 bg-muted rounded" />
      </div>
    </div>
  );
}
