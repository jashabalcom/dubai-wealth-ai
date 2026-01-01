import { 
  Clock, 
  MapPin, 
  Star, 
  AlertCircle, 
  CheckCircle,
  Flame,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataBadge } from "@/components/ui/data-display";
import { Link } from "react-router-dom";

interface IntelligenceCardProps {
  id: string;
  title: string;
  excerpt?: string;
  quickTake?: string;
  imageUrl?: string;
  investmentRating?: number;
  urgencyLevel?: 'normal' | 'important' | 'urgent';
  affectedAreas?: string[];
  readingTimeMinutes?: number;
  isVerified?: boolean;
  sourceUrl?: string;
  className?: string;
}

const urgencyConfig = {
  normal: {
    badge: null,
    border: "border-border/50"
  },
  important: {
    badge: { variant: 'warning' as const, label: 'Important', icon: AlertCircle },
    border: "border-amber-500/30"
  },
  urgent: {
    badge: { variant: 'error' as const, label: 'Urgent', icon: Flame },
    border: "border-rose-500/30"
  }
};

export function IntelligenceCard({
  id,
  title,
  excerpt,
  quickTake,
  imageUrl,
  investmentRating = 3,
  urgencyLevel = 'normal',
  affectedAreas = [],
  readingTimeMinutes = 3,
  isVerified = false,
  sourceUrl,
  className
}: IntelligenceCardProps) {
  // Defensive: fallback to 'normal' config if urgencyLevel is unexpected
  const urgency = urgencyConfig[urgencyLevel] ?? urgencyConfig.normal;
  const UrgencyIcon = urgency?.badge?.icon;

  return (
    <article className={cn(
      "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
      "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
      urgency.border,
      className
    )}>
      {/* Urgency Accent */}
      {urgencyLevel !== 'normal' && (
        <div className={cn(
          "absolute top-0 left-0 right-0 h-0.5",
          urgencyLevel === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'
        )} />
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {imageUrl && (
          <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 space-y-3">
          {/* Top Row: Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Investment Rating */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-3.5 h-3.5",
                    star <= investmentRating
                      ? "text-primary fill-primary"
                      : "text-muted"
                  )}
                />
              ))}
            </div>

            {/* Urgency Badge */}
            {urgency.badge && UrgencyIcon && (
              <DataBadge variant={urgency.badge.variant}>
                <UrgencyIcon className="w-3 h-3 mr-1" />
                {urgency.badge.label}
              </DataBadge>
            )}

            {/* Verified Badge */}
            {isVerified && (
              <DataBadge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </DataBadge>
            )}

            {/* Reading Time */}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {readingTimeMinutes} min read
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Quick Take or Excerpt */}
          {(quickTake || excerpt) && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {quickTake || excerpt}
            </p>
          )}

          {/* Bottom Row: Areas & Link */}
          <div className="flex items-center justify-between pt-2">
            {/* Affected Areas */}
            {affectedAreas.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[200px]">
                  {affectedAreas.slice(0, 2).join(", ")}
                  {affectedAreas.length > 2 && ` +${affectedAreas.length - 2}`}
                </span>
              </div>
            )}

            {/* Read More Link */}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors ml-auto"
              >
                Read Full
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Featured Intelligence Section Wrapper
interface FeaturedIntelligenceProps {
  articles: IntelligenceCardProps[];
  className?: string;
}

export function FeaturedIntelligence({ articles, className }: FeaturedIntelligenceProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <Star className="w-3.5 h-3.5" />
          Featured Intelligence
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono">
          {articles.length} articles
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4">
        {articles.map((article) => (
          <IntelligenceCard key={article.id} {...article} />
        ))}
      </div>
    </section>
  );
}
