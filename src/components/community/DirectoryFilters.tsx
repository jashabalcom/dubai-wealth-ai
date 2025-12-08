import { Search, X, Filter } from 'lucide-react';
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
}

export function DirectoryFilters({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: DirectoryFiltersProps) {
  const tierOptions = [
    { value: 'elite', label: 'Elite' },
    { value: 'investor', label: 'Investor' },
    { value: 'free', label: 'Free' },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 bg-muted/30 border-border/50"
        />
      </div>

      {/* Filter Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filters
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
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
            value={filters.membershipTier || ''}
            onValueChange={(v) => onFilterChange('membershipTier', v || null)}
          >
            <SelectTrigger className="bg-muted/30 border-border/50">
              <SelectValue placeholder="All tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tiers</SelectItem>
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
              value={filters.country || ''}
              onValueChange={(v) => onFilterChange('country', v || null)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All countries</SelectItem>
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
              value={filters.investmentGoal || ''}
              onValueChange={(v) => onFilterChange('investmentGoal', v || null)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="All goals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All goals</SelectItem>
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
              value={filters.budgetRange || ''}
              onValueChange={(v) => onFilterChange('budgetRange', v || null)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="All budgets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All budgets</SelectItem>
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
              value={filters.timeline || ''}
              onValueChange={(v) => onFilterChange('timeline', v || null)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="All timelines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All timelines</SelectItem>
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
              <Badge variant="secondary" className="text-xs">
                "{filters.search}"
                <button onClick={() => onFilterChange('search', '')} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.membershipTier && (
              <Badge variant="secondary" className="text-xs capitalize">
                {filters.membershipTier}
                <button onClick={() => onFilterChange('membershipTier', null)} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.country && (
              <Badge variant="secondary" className="text-xs">
                {filters.country}
                <button onClick={() => onFilterChange('country', null)} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.investmentGoal && (
              <Badge variant="secondary" className="text-xs">
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
