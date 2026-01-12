import { useEffect, useState } from 'react';
import { Crown, Lock } from 'lucide-react';
import { hasEliteAccess } from '@/lib/tier-access';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioMetricsCards } from '@/components/portfolio/PortfolioMetricsCards';
import { PortfolioCharts } from '@/components/portfolio/PortfolioCharts';
import { WealthGrowthChart } from '@/components/portfolio/WealthGrowthChart';
import { AddPropertyDialog } from '@/components/portfolio/AddPropertyDialog';
import { ExpandablePropertyCard } from '@/components/portfolio/ExpandablePropertyCard';
import { ComparisonFloatingBar } from '@/components/portfolio/ComparisonFloatingBar';
import { PortfolioComparisonPanel } from '@/components/portfolio/PortfolioComparisonPanel';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory';
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
  
  const { propertyValueHistory } = usePortfolioHistory(portfolio?.id);
  
  // Selection state for comparison
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Create portfolio on first load for Elite+ users
  useEffect(() => {
    if (user && hasEliteAccess(profile?.membership_tier) && !portfolio && !loading) {
      createPortfolio.mutate();
    }
  }, [user, profile, portfolio, loading]);

  const handleSelectProperty = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected ? [...prev, id] : prev.filter(pid => pid !== id)
    );
  };

  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));

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

  // Non-Elite+ access restriction
  if (!hasEliteAccess(profile?.membership_tier)) {
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
        {loading ? (
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-10 w-64 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-10 w-36 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Metrics skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-7 w-24 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Chart skeleton */}
            <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
            
            {/* Properties skeleton */}
            <div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-xl bg-card border border-border flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <PortfolioHeader 
                  totalValue={metrics.totalValue}
                  dataSource="user"
                />
              </div>
              <div className="flex-shrink-0">
                <AddPropertyDialog
                  onSubmit={(property) => addProperty.mutate(property)}
                  isSubmitting={addProperty.isPending}
                />
              </div>
            </div>

            {/* Metrics Cards */}
            <PortfolioMetricsCards metrics={metrics} propertyCount={properties.length} portfolioId={portfolio?.id} />

            {/* Wealth Growth Chart */}
            {properties.length > 0 && <WealthGrowthChart properties={properties} />}

            {/* Portfolio Charts */}
            {properties.length > 0 && <PortfolioCharts properties={properties} />}

            {/* Properties List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
              {properties.length === 0 ? (
                <div className="bg-card border border-border rounded-xl">
                  <EmptyState
                    icon={Briefcase}
                    title="Start tracking your investments"
                    description="Add your Dubai properties to monitor their performance, track value appreciation, and analyze your portfolio's cash flow in one place."
                    action={{ label: 'Add Your First Property', onClick: () => {} }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <ExpandablePropertyCard
                      key={property.id}
                      property={property}
                      isSelected={selectedIds.includes(property.id)}
                      onSelect={handleSelectProperty}
                      onDelete={(id) => deleteProperty.mutate(id)}
                      historicalValues={propertyValueHistory[property.id] || []}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Comparison Floating Bar */}
      <ComparisonFloatingBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onCompare={() => setShowComparison(true)}
      />

      {/* Comparison Panel */}
      <PortfolioComparisonPanel
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        properties={selectedProperties}
      />
    </div>
  );
}
