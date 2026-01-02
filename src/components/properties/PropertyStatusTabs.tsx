import { Building2, Clock, Check, Home, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

type PropertyStatus = 'all' | 'ready' | 'off_plan';
type ListingType = 'buy' | 'rent';

interface PropertyStatusTabsProps {
  value: PropertyStatus;
  onChange: (status: PropertyStatus) => void;
  counts: {
    all: number;
    ready: number;
    off_plan: number;
  };
  listingType: ListingType;
  onListingTypeChange: (type: ListingType) => void;
  listingCounts?: {
    buy: number;
    rent: number;
  };
}

export function PropertyStatusTabs({ 
  value, 
  onChange, 
  counts, 
  listingType, 
  onListingTypeChange,
  listingCounts = { buy: 0, rent: 0 }
}: PropertyStatusTabsProps) {
  const statusTabs = [
    {
      id: 'all' as const,
      label: 'All',
      icon: Building2,
      count: counts.all,
    },
    {
      id: 'ready' as const,
      label: 'Ready',
      icon: Check,
      count: counts.ready,
    },
    {
      id: 'off_plan' as const,
      label: 'Off-Plan',
      icon: Clock,
      count: counts.off_plan,
    },
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Primary Buy/Rent Toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => onListingTypeChange('buy')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
            listingType === 'buy'
              ? "bg-gold text-navy shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-4 h-4" />
          <span>Buy</span>
          {listingCounts.buy > 0 && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              listingType === 'buy' ? "bg-navy/20 text-navy" : "bg-background text-muted-foreground"
            )}>
              {listingCounts.buy.toLocaleString()}
            </span>
          )}
        </button>
        <button
          onClick={() => onListingTypeChange('rent')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
            listingType === 'rent'
              ? "bg-gold text-navy shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Key className="w-4 h-4" />
          <span>Rent</span>
          {listingCounts.rent > 0 && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold",
              listingType === 'rent' ? "bg-navy/20 text-navy" : "bg-background text-muted-foreground"
            )}>
              {listingCounts.rent.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Secondary Status Tabs - Only show for Buy */}
      {listingType === 'buy' && (
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = value === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  "border min-h-[40px]",
                  isActive
                    ? "bg-card text-foreground border-gold/50 shadow-sm"
                    : "bg-card/50 text-muted-foreground border-border hover:border-gold/30 hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
