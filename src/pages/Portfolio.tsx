import { useEffect, useState } from 'react';
import { Crown, Lock } from 'lucide-react';
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

  // Create portfolio on first load for Elite users
  useEffect(() => {
    if (user && profile?.membership_tier === 'elite' && !portfolio && !loading) {
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
        {loading ? (
          <div className="space-y-6">
            <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
              ))}
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
                    title="Your portfolio is empty"
                    description="Add your first property to start tracking your Dubai real estate investments."
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
