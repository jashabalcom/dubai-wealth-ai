import { useEffect } from 'react';
import { Crown, Briefcase, Lock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { PortfolioMetricsCards } from '@/components/portfolio/PortfolioMetricsCards';
import { PortfolioCharts } from '@/components/portfolio/PortfolioCharts';
import { AddPropertyDialog } from '@/components/portfolio/AddPropertyDialog';
import { PropertyList } from '@/components/portfolio/PropertyList';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';

export default function Portfolio() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    portfolio,
    properties,
    metrics,
    loading,
    createPortfolio,
    addProperty,
    deleteProperty,
  } = usePortfolio();

  // Create portfolio on first load for Elite users
  useEffect(() => {
    if (user && profile?.membership_tier === 'elite' && !portfolio && !loading) {
      createPortfolio.mutate();
    }
  }, [user, profile, portfolio, loading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Non-Elite access restriction
  if (profile?.membership_tier !== 'elite') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
              <Lock className="h-10 w-10 text-gold" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Elite Members Only</h1>
            <p className="text-muted-foreground mb-8">
              Portfolio tracking is an exclusive feature for Elite members. Upgrade your membership to unlock multi-property tracking, value charts, and cash-flow metrics.
            </p>
            <Link to="/#membership">
              <Button className="bg-gold hover:bg-gold/90 text-background">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Elite
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Briefcase className="h-6 w-6 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                  <Crown className="h-3 w-3" />
                  Elite
                </span>
              </div>
              <p className="text-muted-foreground">
                Track your Dubai real estate investments
              </p>
            </div>
          </div>
          
          <AddPropertyDialog
            onSubmit={(property) => addProperty.mutate(property)}
            isSubmitting={addProperty.isPending}
          />
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <PortfolioMetricsCards metrics={metrics} propertyCount={properties.length} />

            {/* Charts */}
            {properties.length > 0 && <PortfolioCharts properties={properties} />}

            {/* Properties List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
              <PropertyList
                properties={properties}
                onDelete={(id) => deleteProperty.mutate(id)}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
