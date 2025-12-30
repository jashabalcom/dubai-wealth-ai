import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { eventTypeLabels, eventTypeColors } from "./CalendarEventDot";
import { useCalendarLocations } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  selectedImportance: string | null;
  onImportanceChange: (importance: string | null) => void;
  className?: string;
}

const marketEventTypes = ['launch', 'handover', 'conference', 'report', 'economic'];

export function CalendarFilters({
  selectedTypes,
  onTypesChange,
  selectedLocation,
  onLocationChange,
  selectedImportance,
  onImportanceChange,
  className,
}: CalendarFiltersProps) {
  const { data: locations = [] } = useCalendarLocations();
  const hasFilters = selectedTypes.length > 0 || selectedLocation || selectedImportance;

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const clearFilters = () => {
    onTypesChange([]);
    onLocationChange(null);
    onImportanceChange(null);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Event Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-3.5 h-3.5" />
            Event Type
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Event Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {marketEventTypes.map((type) => {
            const colors = eventTypeColors[type];
            return (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
                  {eventTypeLabels[type]}
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location Filter */}
      <Select
        value={selectedLocation || 'all'}
        onValueChange={(value) => onLocationChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Importance Filter */}
      <Select
        value={selectedImportance || 'all'}
        onValueChange={(value) => onImportanceChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue placeholder="Importance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="high">Important Only</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
