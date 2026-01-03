import { useState } from 'react';
import { 
  Filter, 
  X, 
  ArrowUpDown, 
  Grid3X3, 
  Map,
  Search,
  ChevronDown
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const projectPriceRanges = [
  { value: 'all', label: 'Any Price', min: 0, max: Infinity },
  { value: '0-1m', label: 'Under 1M', min: 0, max: 1000000 },
  { value: '1m-2m', label: '1M - 2M', min: 1000000, max: 2000000 },
  { value: '2m-5m', label: '2M - 5M', min: 2000000, max: 5000000 },
  { value: '5m-10m', label: '5M - 10M', min: 5000000, max: 10000000 },
  { value: '10m+', label: '10M+', min: 10000000, max: Infinity },
];

export const projectBedroomOptions = [
  { value: 'all', label: 'Any Beds' },
  { value: 'studio', label: 'Studio' },
  { value: '1', label: '1 BR' },
  { value: '2', label: '2 BR' },
  { value: '3', label: '3 BR' },
  { value: '4+', label: '4+ BR' },
];

export const projectSortOptions = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'handover', label: 'Handover Date' },
  { value: 'newest', label: 'Newest' },
];

interface Developer {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface ProjectsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  selectedPrice: string;
  onPriceChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedDevelopers: string[];
  onDevelopersChange: (value: string[]) => void;
  selectedHandoverYear: string;
  onHandoverYearChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
  areas: string[];
  developers: Developer[];
  handoverYears: number[];
}

export function ProjectsFilters({
  searchQuery,
  onSearchChange,
  selectedArea,
  onAreaChange,
  selectedBedrooms,
  onBedroomsChange,
  selectedPrice,
  onPriceChange,
  selectedStatus,
  onStatusChange,
  selectedDevelopers,
  onDevelopersChange,
  selectedHandoverYear,
  onHandoverYearChange,
  sortBy,
  onSortChange,
  onClearFilters,
  resultCount,
  viewMode,
  onViewModeChange,
  areas,
  developers,
  handoverYears,
}: ProjectsFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters = 
    searchQuery || 
    selectedArea !== 'All Areas' || 
    selectedBedrooms !== 'all' || 
    selectedPrice !== 'all' ||
    selectedStatus !== 'all' ||
    selectedDevelopers.length > 0 ||
    selectedHandoverYear !== 'all';

  const activeFilterCount = [
    searchQuery,
    selectedArea !== 'All Areas',
    selectedBedrooms !== 'all',
    selectedPrice !== 'all',
    selectedStatus !== 'all',
    selectedDevelopers.length > 0,
    selectedHandoverYear !== 'all',
  ].filter(Boolean).length;

  const toggleDeveloper = (developerId: string) => {
    if (selectedDevelopers.includes(developerId)) {
      onDevelopersChange(selectedDevelopers.filter(id => id !== developerId));
    } else {
      onDevelopersChange([...selectedDevelopers, developerId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Actions Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Mobile Filter Sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden min-h-[44px] px-3">
                <Filter className="w-4 h-4 mr-1.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-[20px] px-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <MobileFilterContent
                selectedArea={selectedArea}
                onAreaChange={onAreaChange}
                selectedBedrooms={selectedBedrooms}
                onBedroomsChange={onBedroomsChange}
                selectedPrice={selectedPrice}
                onPriceChange={onPriceChange}
                selectedHandoverYear={selectedHandoverYear}
                onHandoverYearChange={onHandoverYearChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                areas={areas}
                handoverYears={handoverYears}
              />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px] hidden md:flex">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {projectSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
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
        </div>
      </div>

      {/* Desktop Filters Row */}
      <div className="hidden lg:flex items-center gap-3 flex-wrap">
        {/* Area Filter */}
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Filter */}
        <Select value={selectedPrice} onValueChange={onPriceChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {projectPriceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bedrooms Filter */}
        <Select value={selectedBedrooms} onValueChange={onBedroomsChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            {projectBedroomOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Handover Year Filter */}
        <Select value={selectedHandoverYear} onValueChange={onHandoverYearChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Handover" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Year</SelectItem>
            {handoverYears.map((year) => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Developer Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {selectedDevelopers.length > 0 
                ? `${selectedDevelopers.length} Developer${selectedDevelopers.length > 1 ? 's' : ''}`
                : 'All Developers'}
              <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] max-h-[300px] overflow-y-auto">
            {developers.map((developer) => (
              <DropdownMenuCheckboxItem
                key={developer.id}
                checked={selectedDevelopers.includes(developer.id)}
                onCheckedChange={() => toggleDeveloper(developer.id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={developer.logo_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {developer.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{developer.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters & Results Count */}
      {(hasActiveFilters || resultCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {resultCount} project{resultCount !== 1 ? 's' : ''} found
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function MobileFilterContent({
  selectedArea,
  onAreaChange,
  selectedBedrooms,
  onBedroomsChange,
  selectedPrice,
  onPriceChange,
  selectedHandoverYear,
  onHandoverYearChange,
  sortBy,
  onSortChange,
  areas,
  handoverYears,
}: {
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedBedrooms: string;
  onBedroomsChange: (value: string) => void;
  selectedPrice: string;
  onPriceChange: (value: string) => void;
  selectedHandoverYear: string;
  onHandoverYearChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  areas: string[];
  handoverYears: number[];
}) {
  return (
    <div className="space-y-5 py-4 px-1">
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Area</label>
        <Select value={selectedArea} onValueChange={onAreaChange}>
          <SelectTrigger className="w-full">
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
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <Select value={selectedPrice} onValueChange={onPriceChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectPriceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Bedrooms</label>
        <Select value={selectedBedrooms} onValueChange={onBedroomsChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectBedroomOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Handover Year</label>
        <Select value={selectedHandoverYear} onValueChange={onHandoverYearChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Year</SelectItem>
            {handoverYears.map((year) => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
