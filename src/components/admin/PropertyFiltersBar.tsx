import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PropertyFilters } from '@/hooks/useAdminProperties';

const PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'land'];
const LISTING_TYPES = ['sale', 'rent'];
const STATUSES = ['available', 'sold', 'reserved'];

interface PropertyFiltersBarProps {
  filters: PropertyFilters;
  updateFilter: (key: keyof PropertyFilters, value: string) => void;
  clearFilters: () => void;
  locationAreas: string[];
}

export function PropertyFiltersBar({ 
  filters, 
  updateFilter, 
  clearFilters,
  locationAreas,
}: PropertyFiltersBarProps) {
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'source' || key === 'hasImages' || key === 'hasCoords' || key === 'isPublished') {
      return value !== 'all';
    }
    return value !== '';
  }).length;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, area, developer..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Location Area */}
        <Select value={filters.locationArea || 'all'} onValueChange={(v) => updateFilter('locationArea', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {locationAreas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Property Type */}
        <Select value={filters.propertyType || 'all'} onValueChange={(v) => updateFilter('propertyType', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Listing Type */}
        <Select value={filters.listingType || 'all'} onValueChange={(v) => updateFilter('listingType', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sale/Rent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            {LISTING_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">For {type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source */}
        <Select value={filters.source} onValueChange={(v) => updateFilter('source', v as PropertyFilters['source'])}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="bayut">Bayut Sync</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status || 'all'} onValueChange={(v) => updateFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quality filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Quality:</span>
        </div>

        {/* Has Images */}
        <Select value={filters.hasImages} onValueChange={(v) => updateFilter('hasImages', v as PropertyFilters['hasImages'])}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Images" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Images</SelectItem>
            <SelectItem value="yes">Has Images</SelectItem>
            <SelectItem value="no">No Images</SelectItem>
          </SelectContent>
        </Select>

        {/* Has Coords */}
        <Select value={filters.hasCoords} onValueChange={(v) => updateFilter('hasCoords', v as PropertyFilters['hasCoords'])}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Location</SelectItem>
            <SelectItem value="yes">Has Coords</SelectItem>
            <SelectItem value="no">No Coords</SelectItem>
          </SelectContent>
        </Select>

        {/* Is Published */}
        <Select value={filters.isPublished} onValueChange={(v) => updateFilter('isPublished', v as PropertyFilters['isPublished'])}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Visibility</SelectItem>
            <SelectItem value="yes">Published</SelectItem>
            <SelectItem value="no">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
