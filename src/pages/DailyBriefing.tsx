import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDigestByDate, useLatestDigest } from '@/hooks/useDailyDigest';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Lock, Crown, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { normalizeUrgencyLevel } from '@/lib/urgency';

// Bloomberg-style components
import { BloombergBriefing } from '@/components/briefing/BloombergBriefing';
import { MarketTicker } from '@/components/briefing/MarketTicker';
import { ExecutiveSummary } from '@/components/briefing/ExecutiveSummary';
import { MetricsDashboard } from '@/components/briefing/MetricsDashboard';
import { SectorAnalysis } from '@/components/briefing/SectorAnalysis';
import { AreaHighlights } from '@/components/briefing/AreaHighlights';
import { FeaturedIntelligence } from '@/components/briefing/IntelligenceCard';
import { BriefingFooter } from '@/components/briefing/BriefingFooter';
import { EmptyBriefing } from '@/components/briefing/EmptyBriefing';

// Date picker for Elite users
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Loading skeleton
import { Skeleton } from '@/components/ui/skeleton';

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function BriefingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Ticker skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />
      
      {/* Summary skeleton */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      
      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      
      {/* Sectors skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Locked Content Overlay Component
function LockedContent({ title, tier }: { title: string; tier: 'investor' | 'elite' }) {
  const upgradeLink = tier === 'investor' ? '/pricing' : '/upgrade';
  const tierLabel = tier === 'investor' ? 'Investor' : 'Elite';
  
  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred placeholder */}
      <div className="blur-sm opacity-50 pointer-events-none">
        <div className="h-64 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">{title}</span>
        </div>
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-xl border border-border">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center px-4">
          <h4 className="font-semibold text-foreground mb-1">{tierLabel}+ Feature</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to {tierLabel} to unlock {title.toLowerCase()}
          </p>
          <Button asChild size="sm">
            <Link to={upgradeLink}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const DailyBriefing = () => {
  const { date } = useParams<{ date?: string }>();
  const [digestArticles, setDigestArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );
  const { user, profile } = useAuth();
  
  // Determine user tier
  const membershipTier = profile?.membership_tier || 'free';
  const isFreeTier = !user || membershipTier === 'free';
  const isInvestorTier = membershipTier === 'investor';
  const isEliteTier = membershipTier === 'elite' || membershipTier === 'private';
  const hasFullAccess = !isFreeTier; // Investor+ gets full access
  const hasHistoricalAccess = isEliteTier; // Only Elite gets historical access

  // Use specific date or latest
  const { digest: specificDigest, isLoading: isLoadingSpecific } = useDigestByDate(date || '');
  const { digest: latestDigest, isLoading: isLoadingLatest } = useLatestDigest();

  const digest = date ? specificDigest : latestDigest;
  const isLoading = date ? isLoadingSpecific : isLoadingLatest;

  // Fetch articles included in this digest
  useEffect(() => {
    if (!digest?.top_article_ids?.length) return;

    async function fetchArticles() {
      setIsLoadingArticles(true);
      try {
        const { data } = await supabase
          .from('news_articles')
          .select('*')
          .in('id', digest.top_article_ids)
          .eq('status', 'published');

        setDigestArticles(data || []);
      } catch (err) {
        console.error('Error fetching digest articles:', err);
      } finally {
        setIsLoadingArticles(false);
      }
    }

    fetchArticles();
  }, [digest?.top_article_ids]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 max-w-6xl py-8">
            <BriefingSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty state
  if (!digest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <EmptyBriefing date={date} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Transform articles for IntelligenceCard format with safe urgency normalization
  const intelligenceArticles = (digestArticles || []).map((article) => ({
    id: article.id,
    title: article.title || '',
    excerpt: article.excerpt || '',
    quickTake: article.quick_take || '',
    imageUrl: article.image_url || '',
    investmentRating: article.investment_rating || 3,
    urgencyLevel: normalizeUrgencyLevel(article.urgency_level),
    affectedAreas: Array.isArray(article.affected_areas) ? article.affected_areas : [],
    readingTimeMinutes: article.reading_time_minutes || 3,
    isVerified: article.verification_status === 'verified',
    sourceUrl: article.source_url || '',
  }));

  return (
    <>
      <Helmet>
        <title>Daily Market Intelligence - {formatDisplayDate(digest.digest_date)} | Dubai Wealth Hub</title>
        <meta
          name="description"
          content={`Dubai real estate market intelligence for ${formatDisplayDate(digest.digest_date)}: ${digest.headline || 'Market Update'}`}
        />
        <link rel="canonical" href={`https://dubaiwealthhub.com/briefing/${digest.digest_date}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={digest.headline || 'Daily Market Intelligence'} />
        <meta property="og:description" content={(digest.executive_summary || '').slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16">
          <BloombergBriefing 
            date={digest.digest_date}
            generatedAt={digest.generated_at || digest.created_at}
            hasHistoricalAccess={hasHistoricalAccess}
            selectedDate={selectedDate}
            onDateChange={(newDate) => {
              setSelectedDate(newDate);
              if (newDate) {
                window.location.href = `/briefing/${format(newDate, 'yyyy-MM-dd')}`;
              }
            }}
          >
            {/* Market Ticker - Always visible */}
            <MarketTicker
              transactionVolume={digest.transaction_volume || undefined}
              avgPriceSqft={digest.avg_price_sqft || undefined}
              sentiment={digest.market_sentiment || undefined}
            />

            {/* Executive Summary - Always visible (preview for free users) */}
            <ExecutiveSummary
              headline={digest.headline}
              summary={digest.executive_summary}
              sentiment={digest.market_sentiment || 'neutral'}
              investmentAction={digest.investment_action || 'watch'}
              confidenceScore={digest.confidence_score || 3}
              keyTakeaways={hasFullAccess ? (digest.key_takeaways || []) : []}
            />

            {/* Free tier upgrade CTA */}
            {isFreeTier && (
              <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
                <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  Unlock Full Market Intelligence
                </h3>
                <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                  Upgrade to Investor to access comprehensive metrics, sector analysis, area insights, and featured intelligence articles.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg">
                    <Link to="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Investor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/auth">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Metrics Dashboard - Locked for free users */}
            {hasFullAccess ? (
              <MetricsDashboard
                keyMetrics={digest.key_metrics}
                transactionVolume={digest.transaction_volume || undefined}
                avgPriceSqft={digest.avg_price_sqft || undefined}
              />
            ) : (
              <LockedContent title="Key Metrics Dashboard" tier="investor" />
            )}

            {/* Two Column Layout for Sectors & Areas */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sector Analysis */}
              {hasFullAccess ? (
                <SectorAnalysis
                  sectorHighlights={digest.sector_highlights}
                />
              ) : (
                <LockedContent title="Sector Analysis" tier="investor" />
              )}

              {/* Area Highlights */}
              {hasFullAccess ? (
                <AreaHighlights
                  areaHighlights={(digest.top_areas && digest.top_areas.length > 0) ? digest.top_areas : digest.area_highlights}
                />
              ) : (
                <LockedContent title="Area Highlights" tier="investor" />
              )}
            </div>

            {/* Featured Intelligence */}
            {hasFullAccess && intelligenceArticles.length > 0 && (
              <FeaturedIntelligence articles={intelligenceArticles} />
            )}
            
            {!hasFullAccess && (
              <LockedContent title="Featured Intelligence Articles" tier="investor" />
            )}

            {/* Footer with Sources & Methodology */}
            <BriefingFooter
              dataSources={digest.data_sources || []}
              generatedAt={digest.generated_at || digest.created_at}
            />
          </BloombergBriefing>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DailyBriefing;
