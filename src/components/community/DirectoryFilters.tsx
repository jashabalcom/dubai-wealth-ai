import { useState } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { DirectoryFilters as FiltersType } from '@/hooks/useMemberDirectory';

interface DirectoryFiltersProps {
  filters: FiltersType;
  filterOptions: {
    countries: string[];
    investmentGoals: string[];
    budgetRanges: string[];
    timelines: string[];
  };
  onFilterChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  variant?: 'sidebar' | 'mobile';
}

const tierOptions = [
  { value: 'elite', label: 'Elite' },
  { value: 'investor', label: 'Investor' },
  { value: 'free', label: 'Free' },
];

function FilterContent({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: Omit<DirectoryFiltersProps, 'variant'>) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 bg-muted/30 border-border/40 focus:border-gold/50"
        />
      </div>

      {/* Filter Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4 text-gold/70" />
          Filters
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="space-y-3">
        {/* Membership Tier */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Membership</label>
          <Select
            value={filters.membershipTier || 'all'}
            onValueChange={(v) => onFilterChange('membershipTier', v === 'all' ? null : v)}
          >
            <SelectTrigger className="bg-muted/30 border-border/40 focus:border-gold/50">
              <SelectValue placeholder="All tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              {tierOptions.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        {filterOptions.countries.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Country</label>
            <Select
              value={filters.country || 'all'}
              onValueChange={(v) => onFilterChange('country', v === 'all' ? null : v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/40 focus:border-gold/50">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {filterOptions.countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Investment Goal */}
        {filterOptions.investmentGoals.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Investment Goal</label>
            <Select
              value={filters.investmentGoal || 'all'}
              onValueChange={(v) => onFilterChange('investmentGoal', v === 'all' ? null : v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/40 focus:border-gold/50">
                <SelectValue placeholder="All goals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All goals</SelectItem>
                {filterOptions.investmentGoals.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Budget Range */}
        {filterOptions.budgetRanges.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Budget Range</label>
            <Select
              value={filters.budgetRange || 'all'}
              onValueChange={(v) => onFilterChange('budgetRange', v === 'all' ? null : v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/40 focus:border-gold/50">
                <SelectValue placeholder="All budgets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All budgets</SelectItem>
                {filterOptions.budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Timeline */}
        {filterOptions.timelines.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Timeline</label>
            <Select
              value={filters.timeline || 'all'}
              onValueChange={(v) => onFilterChange('timeline', v === 'all' ? null : v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/40 focus:border-gold/50">
                <SelectValue placeholder="All timelines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All timelines</SelectItem>
                {filterOptions.timelines.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {timeline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-1.5">
            {filters.search && (
              <Badge variant="secondary" className="text-xs bg-muted/70">
                "{filters.search}"
                <button onClick={() => onFilterChange('search', '')} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.membershipTier && (
              <Badge variant="secondary" className="text-xs capitalize bg-gold/10 text-gold border-gold/20">
                {filters.membershipTier}
                <button onClick={() => onFilterChange('membershipTier', null)} className="ml-1 hover:text-gold">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.country && (
              <Badge variant="secondary" className="text-xs bg-muted/70">
                {filters.country}
                <button onClick={() => onFilterChange('country', null)} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.investmentGoal && (
              <Badge variant="secondary" className="text-xs bg-muted/70">
                {filters.investmentGoal}
                <button onClick={() => onFilterChange('investmentGoal', null)} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DirectoryFilters(props: DirectoryFiltersProps) {
  const { variant = 'sidebar', hasActiveFilters, onClearFilters } = props;
  const [isOpen, setIsOpen] = useState(false);

  // Desktop sidebar variant
  if (variant === 'sidebar') {
    return <FilterContent {...props} />;
  }

  // Mobile sheet variant
  const activeCount = [
    props.filters.search,
    props.filters.membershipTier,
    props.filters.country,
    props.filters.investmentGoal,
    props.filters.budgetRange,
    props.filters.timeline,
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 border-border/40',
            hasActiveFilters && 'border-gold/40 bg-gold/5 text-gold'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gold text-secondary">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border/30">
          <SheetTitle className="font-serif text-xl">Filter Members</SheetTitle>
        </SheetHeader>
        <div className="py-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <FilterContent {...props} />
        </div>
        <SheetFooter className="pt-4 border-t border-border/30 gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => {
                onClearFilters();
              }}
              className="flex-1"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gradient-to-r from-gold to-gold/90 text-secondary hover:from-gold hover:to-gold/80"
          >
            Show Results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Mobile filter bar component for sticky header
export function MobileFilterBar({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  sortBy,
  onSortChange,
}: DirectoryFiltersProps & {
  sortBy: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-card/95 backdrop-blur-xl border-b border-border/30 sticky top-[64px] z-20 lg:hidden">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-9 h-9 bg-muted/30 border-border/40 text-sm"
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[100px] h-9 bg-muted/30 border-border/40 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
      <DirectoryFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
        variant="mobile"
      />
    </div>
  );
}