import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDigestByDate, useLatestDigest } from '@/hooks/useDailyDigest';
import { DailyDigest, DailyDigestSkeleton } from '@/components/news/DailyDigest';
import { InvestorBriefingCard, InvestorBriefingCardSkeleton } from '@/components/news/InvestorBriefingCard';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <DailyDigestSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              No Briefing Available
            </h1>
            <p className="text-muted-foreground mb-6">
              {date 
                ? `No market briefing found for ${formatDisplayDate(date)}.`
                : 'No market briefings have been published yet.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View All Articles
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/community/news">Market News</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Daily Market Briefing - {formatDisplayDate(digest.digest_date)} | Dubai Wealth Hub</title>
        <meta
          name="description"
          content={`Dubai real estate market briefing for ${formatDisplayDate(digest.digest_date)}: ${digest.headline}`}
        />
        <link rel="canonical" href={`https://dubaiwealthhub.com/briefing/${digest.digest_date}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: 'Daily Briefing' },
              ]}
              className="mb-6"
            />

            {/* Main Digest */}
            <DailyDigest digest={digest} />

            {/* Articles in this Digest */}
            {digestArticles.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Articles in This Briefing
                </h2>
                
                {isLoadingArticles ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <InvestorBriefingCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {digestArticles.map((article) => (
                      <InvestorBriefingCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t border-border">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Articles
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DailyBriefing;
