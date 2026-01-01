import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDigestByDate, useLatestDigest } from '@/hooks/useDailyDigest';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

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

const DailyBriefing = () => {
  const { date } = useParams<{ date?: string }>();
  const [digestArticles, setDigestArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

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

  // Transform articles for IntelligenceCard format
  const intelligenceArticles = digestArticles.map((article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    quickTake: article.quick_take,
    imageUrl: article.image_url,
    investmentRating: article.investment_rating || 3,
    urgencyLevel: article.urgency_level as 'normal' | 'important' | 'urgent',
    affectedAreas: article.affected_areas || [],
    readingTimeMinutes: article.reading_time_minutes || 3,
    isVerified: article.verification_status === 'verified',
    sourceUrl: article.source_url,
  }));

  return (
    <>
      <Helmet>
        <title>Daily Market Intelligence - {formatDisplayDate(digest.digest_date)} | Dubai Wealth Hub</title>
        <meta
          name="description"
          content={`Dubai real estate market intelligence for ${formatDisplayDate(digest.digest_date)}: ${digest.headline}`}
        />
        <link rel="canonical" href={`https://dubaiwealthhub.com/briefing/${digest.digest_date}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={digest.headline} />
        <meta property="og:description" content={digest.executive_summary.slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16">
          <BloombergBriefing 
            date={digest.digest_date}
            generatedAt={digest.generated_at || digest.created_at}
          >
            {/* Market Ticker */}
            <MarketTicker
              transactionVolume={digest.transaction_volume || undefined}
              avgPriceSqft={digest.avg_price_sqft || undefined}
              sentiment={digest.market_sentiment || undefined}
            />

            {/* Executive Summary */}
            <ExecutiveSummary
              headline={digest.headline}
              summary={digest.executive_summary}
              sentiment={digest.market_sentiment || 'neutral'}
              investmentAction={digest.investment_action || 'watch'}
              confidenceScore={digest.confidence_score || 3}
              keyTakeaways={digest.key_takeaways || []}
            />

            {/* Metrics Dashboard */}
            <MetricsDashboard
              keyMetrics={digest.key_metrics || []}
              transactionVolume={digest.transaction_volume || undefined}
              avgPriceSqft={digest.avg_price_sqft || undefined}
            />

            {/* Two Column Layout for Sectors & Areas */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sector Analysis */}
              <SectorAnalysis
                sectorHighlights={digest.sector_highlights?.map(s => ({
                  ...s,
                  sentiment: s.sentiment as 'positive' | 'negative' | 'neutral'
                })) || []}
              />

              {/* Area Highlights */}
              <AreaHighlights
                areaHighlights={digest.top_areas || digest.area_highlights || []}
              />
            </div>

            {/* Featured Intelligence */}
            {intelligenceArticles.length > 0 && (
              <FeaturedIntelligence articles={intelligenceArticles} />
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
