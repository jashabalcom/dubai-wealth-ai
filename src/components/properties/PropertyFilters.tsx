import { Filter, X, Calendar, ArrowUpDown, Grid3X3, Map, Sparkles, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SearchAutocomplete } from './SearchAutocomplete';

export const areas = [
  'All Areas',
  'Dubai Marina',
  'Downtown Dubai',
  'Palm Jumeirah',
  'Business Bay',
  'JVC',
  'Emaar Beachfront',
  'Dubai Creek Harbour',
  'MBR City',
  'Damac Lagoons',
  'The Valley',
  'Tilal Al Ghaf',
];

export const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
];

export const bedroomOptions = [
  { value: '-1', label: 'Any' },
  { value: '0', label: 'Studio' },
  { value: '1', label: '1 BR' },
  { value: '2', label: '2 BR' },
  { value: '3', label: '3 BR' },
  { value: '4', label: '4+ BR' },
];

export const priceRanges = [
  { value: 'all', label: 'Any Price', min: 0, max: Infinity },
  { value: '0-1m', label: 'Under 1M', min: 0, max: 1000000 },
  { value: '1m-2m', label: '1M - 2M', min: 1000000, max: 2000000 },
  { value: '2m-5m', label: '2M - 5M', min: 2000000, max: 5000000 },
  { value: '5m-10m', label: '5M - 10M', min: 5000000, max: 10000000 },
  { value: '10m+', label: '10M+', min: 10000000, max: Infinity },
];

export const scoreRanges = [
  { value: 'all', label: 'Any Score', min: 0 },
  { value: '60+', label: '60+ Good', min: 60 },
  { value: '70+', label: '70+ Very Good', min: 70 },
  { value: '80+', label: '80+ Excellent', min: 80 },
];

export const yieldRanges = [
  { value: 'all', label: 'Any Yield', min: 0 },
  { value: '5+', label: '5%+', min: 5 },
  { value: '6+', label: '6%+', min: 6 },
  { value: '7+', label: '7%+', min: 7 },
  { value: '8+', label: '8%+', min: 8 },
];

export const sortOptions = [
  { value: 'featured', label: 'Featured First' },
  { value: 'score-desc', label: 'Investment Score' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'yield-desc', label: 'Highest Yield' },
  { value: 'size-desc', label: 'Largest' },
  { value: 'newest', label: 'Newest' },
];

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  selectedPrice: string;
  onPriceChange: (value: string) => void;
  showOffPlanOnly: boolean;
  onOffPlanChange: (value: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  viewMode?: 'grid' | 'map';
  onViewModeChange?: (mode: 'grid' | 'map') => void;
  // Smart investment filters
  selectedScore?: string;
  onScoreChange?: (value: string) => void;
  selectedYield?: string;
  onYieldChange?: (value: string) => void;
  showGoldenVisaOnly?: boolean;
  onGoldenVisaChange?: (value: boolean) => void;
  showBelowMarketOnly?: boolean;
  onBelowMarketChange?: (value: boolean) => void;
  // Autocomplete data
  propertyCounts?: Record<string, number>;
  developerCounts?: Record<string, number>;
}

export function PropertyFilters({
  searchQuery,
  onSearchChange,
  selectedArea,
  onAreaChange,
  selectedType,
  onTypeChange,
  selectedBedrooms,
  onBedroomsChange,
  selectedPrice,
  onPriceChange,
  showOffPlanOnly,
  onOffPlanChange,
  sortBy,
  onSortChange,
  onClearFilters,
  resultCount,
  viewMode = 'grid',
  onViewModeChange,
  // Smart filters
  selectedScore = 'all',
  onScoreChange,
  selectedYield = 'all',
  onYieldChange,
  showGoldenVisaOnly = false,
  onGoldenVisaChange,
  showBelowMarketOnly = false,
  onBelowMarketChange,
  propertyCounts = {},
  developerCounts = {},
}: PropertyFiltersProps) {
  const hasActiveFilters = 
    searchQuery || 
    selectedArea !== 'All Areas' || 
    selectedType !== 'all' || 
    selectedBedrooms !== '-1' || 
    selectedPrice !== 'all' || 
    showOffPlanOnly ||
    selectedScore !== 'all' ||
    selectedYield !== 'all' ||
    showGoldenVisaOnly ||
    showBelowMarketOnly;

  const activeFilterCount = [
    searchQuery,
    selectedArea !== 'All Areas',
    selectedType !== 'all',
    selectedBedrooms !== '-1',
    selectedPrice !== 'all',
    showOffPlanOnly,
    selectedScore !== 'all',
    selectedYield !== 'all',
    showGoldenVisaOnly,
    showBelowMarketOnly,
  ].filter(Boolean).length;

  const smartFilterCount = [
    selectedScore !== 'all',
    selectedYield !== 'all',
    showGoldenVisaOnly,
    showBelowMarketOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchAutocomplete
          value={searchQuery}
          onChange={onSearchChange}
          areas={areas}
          propertyCounts={propertyCounts}
          developerCounts={developerCounts}
          className="flex-1 w-full"
        />
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant={showOffPlanOnly ? 'gold' : 'outline'}
            size="sm"
            onClick={() => onOffPlanChange(!showOffPlanOnly)}
            className="min-h-[44px] px-3"
          >
            <Calendar className="w-4 h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Off-Plan</span>
            <span className="xs:hidden">Off</span>
          </Button>
          
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden min-h-[44px] px-3">
                <Filter className="w-4 h-4 mr-1.5" />
                <span className="hidden xs:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <MobileFilterContent
                  selectedArea={selectedArea}
                  onAreaChange={onAreaChange}
                  selectedType={selectedType}
                  onTypeChange={onTypeChange}
                  selectedBedrooms={selectedBedrooms}
                  onBedroomsChange={onBedroomsChange}
                  selectedPrice={selectedPrice}
                  onPriceChange={onPriceChange}
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  selectedScore={selectedScore}
                  onScoreChange={onScoreChange}
                  selectedYield={selectedYield}
                  onYieldChange={onYieldChange}
                  showGoldenVisaOnly={showGoldenVisaOnly}
                  onGoldenVisaChange={onGoldenVisaChange}
                  showBelowMarketOnly={showBelowMarketOnly}
                  onBelowMarketChange={onBelowMarketChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px] hidden md:flex">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none border-0"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none border-0"
                onClick={() => onViewModeChange('map')}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Filters Row */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBedrooms} onValueChange={onBedroomsChange}>
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            {bedroomOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPrice} onValueChange={onPriceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Smart Investment Filters Row */}
      <div className="hidden lg:flex items-center gap-3 p-3 bg-gold/5 border border-gold/20 rounded-lg">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Smart Filters</span>
          {smartFilterCount > 0 && (
            <Badge className="bg-gold text-navy h-5 px-1.5">
              {smartFilterCount}
            </Badge>
          )}
        </div>
        
        <div className="h-4 w-px bg-gold/30" />

        {onScoreChange && (
          <Select value={selectedScore} onValueChange={onScoreChange}>
            <SelectTrigger className="w-[140px] border-gold/30 bg-transparent">
              <TrendingUp className="w-4 h-4 mr-2 text-gold" />
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              {scoreRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onYieldChange && (
          <Select value={selectedYield} onValueChange={onYieldChange}>
            <SelectTrigger className="w-[120px] border-gold/30 bg-transparent">
              <SelectValue placeholder="Yield" />
            </SelectTrigger>
            <SelectContent>
              {yieldRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onGoldenVisaChange && (
          <Button
            variant={showGoldenVisaOnly ? 'gold' : 'outline'}
            size="sm"
            onClick={() => onGoldenVisaChange(!showGoldenVisaOnly)}
            className={cn(
              "border-gold/30",
              !showGoldenVisaOnly && "bg-transparent hover:bg-gold/10"
            )}
          >
            <Award className="w-4 h-4 mr-2" />
            Golden Visa
          </Button>
        )}

        {onBelowMarketChange && (
          <Button
            variant={showBelowMarketOnly ? 'gold' : 'outline'}
            size="sm"
            onClick={() => onBelowMarketChange(!showBelowMarketOnly)}
            className={cn(
              "border-gold/30",
              !showBelowMarketOnly && "bg-transparent hover:bg-gold/10"
            )}
          >
            Below Market
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {resultCount} properties found
          </span>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function MobileFilterContent({
  selectedArea,
  onAreaChange,
  selectedType,
  onTypeChange,
  selectedBedrooms,
  onBedroomsChange,
  selectedPrice,
  onPriceChange,
  sortBy,
  onSortChange,
  selectedScore,
  onScoreChange,
  selectedYield,
  onYieldChange,
  showGoldenVisaOnly,
  onGoldenVisaChange,
  showBelowMarketOnly,
  onBelowMarketChange,
}: {
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  selectedPrice: string;
  onPriceChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedScore?: string;
  onScoreChange?: (value: string) => void;
  selectedYield?: string;
  onYieldChange?: (value: string) => void;
  showGoldenVisaOnly?: boolean;
  onGoldenVisaChange?: (value: boolean) => void;
  showBelowMarketOnly?: boolean;
  onBelowMarketChange?: (value: boolean) => void;
}) {
  return (
    <div className="space-y-5 px-1">
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="min-h-[44px]">{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Area</label>
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area} className="min-h-[44px]">{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Property Type</label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Bedrooms</label>
        <Select value={selectedBedrooms} onValueChange={onBedroomsChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bedroomOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <Select value={selectedPrice} onValueChange={onPriceChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Smart Investment Filters Section */}
      <div className="pt-4 border-t border-gold/20">
        <div className="flex items-center gap-2 text-gold mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Smart Investment Filters</span>
        </div>

        {onScoreChange && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Investment Score</label>
            <Select value={selectedScore || 'all'} onValueChange={onScoreChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scoreRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {onYieldChange && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Min. Rental Yield</label>
            <Select value={selectedYield || 'all'} onValueChange={onYieldChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yieldRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {onGoldenVisaChange && (
            <Button
              variant={showGoldenVisaOnly ? 'gold' : 'outline'}
              onClick={() => onGoldenVisaChange(!showGoldenVisaOnly)}
              className="border-gold/30 min-h-[48px] justify-start"
            >
              <Award className="w-4 h-4 mr-2" />
              Golden Visa Only
            </Button>
          )}

          {onBelowMarketChange && (
            <Button
              variant={showBelowMarketOnly ? 'gold' : 'outline'}
              onClick={() => onBelowMarketChange(!showBelowMarketOnly)}
              className="border-gold/30 min-h-[48px] justify-start"
            >
              Below Market Value
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
