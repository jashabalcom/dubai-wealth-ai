import { Search, Filter, X, ChevronDown, Calendar, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export const sortOptions = [
  { value: 'featured', label: 'Featured First' },
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
}: PropertyFiltersProps) {
  const hasActiveFilters = 
    searchQuery || 
    selectedArea !== 'All Areas' || 
    selectedType !== 'all' || 
    selectedBedrooms !== '-1' || 
    selectedPrice !== 'all' || 
    showOffPlanOnly;

  const activeFilterCount = [
    searchQuery,
    selectedArea !== 'All Areas',
    selectedType !== 'all',
    selectedBedrooms !== '-1',
    selectedPrice !== 'all',
    showOffPlanOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by location, developer, or property name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={showOffPlanOnly ? 'gold' : 'outline'}
            size="sm"
            onClick={() => onOffPlanChange(!showOffPlanOnly)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Off-Plan
          </Button>
          
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
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
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Area</label>
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
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
    </div>
  );
}
