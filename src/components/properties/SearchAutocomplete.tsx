import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Building, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'area' | 'developer' | 'recent';
  value: string;
  count?: number;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  areas: string[];
  propertyCounts?: Record<string, number>;
  developerCounts?: Record<string, number>;
  placeholder?: string;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'recent_property_searches';
const MAX_RECENT = 5;

export function SearchAutocomplete({
  value,
  onChange,
  areas,
  propertyCounts = {},
  developerCounts = {},
  placeholder = "Search by location, developer, or property name...",
  className,
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to recent searches on selection
  const saveRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== search.toLowerCase());
      const updated = [search, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Build suggestions
  const suggestions: SearchSuggestion[] = [];
  const query = value.toLowerCase().trim();

  if (query) {
    // Area matches
    areas
      .filter(area => area !== 'All Areas' && area.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach(area => {
        suggestions.push({
          type: 'area',
          value: area,
          count: propertyCounts[area] || 0,
        });
      });

    // Developer matches
    Object.entries(developerCounts)
      .filter(([dev]) => dev.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(([dev, count]) => {
        suggestions.push({
          type: 'developer',
          value: dev,
          count,
        });
      });
  } else {
    // Show recent searches when empty
    recentSearches.slice(0, 3).forEach(search => {
      suggestions.push({
        type: 'recent',
        value: search,
      });
    });

    // Show popular areas
    areas
      .filter(area => area !== 'All Areas')
      .slice(0, 4)
      .forEach(area => {
        suggestions.push({
          type: 'area',
          value: area,
          count: propertyCounts[area] || 0,
        });
      });
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    saveRecentSearch(suggestion.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {!query && recentSearches.length > 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
              Recent Searches
            </div>
          )}
          {suggestions.filter(s => s.type === 'recent').map((suggestion, index) => (
            <button
              key={`recent-${index}`}
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                highlightedIndex === index ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{suggestion.value}</span>
            </button>
          ))}

          {suggestions.filter(s => s.type !== 'recent').length > 0 && !query && (
            <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
              Popular Areas
            </div>
          )}
          
          {suggestions.filter(s => s.type === 'area').map((suggestion, index) => {
            const actualIndex = suggestions.findIndex(s => s === suggestion);
            return (
              <button
                key={`area-${index}`}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  highlightedIndex === actualIndex ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm flex-1 truncate">{suggestion.value}</span>
                {suggestion.count !== undefined && suggestion.count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {suggestion.count} {suggestion.count === 1 ? 'property' : 'properties'}
                  </span>
                )}
              </button>
            );
          })}

          {query && suggestions.filter(s => s.type === 'developer').length > 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-t border-border">
              Developers
            </div>
          )}
          
          {suggestions.filter(s => s.type === 'developer').map((suggestion, index) => {
            const actualIndex = suggestions.findIndex(s => s === suggestion);
            return (
              <button
                key={`dev-${index}`}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  highlightedIndex === actualIndex ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <Building className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm flex-1 truncate">{suggestion.value}</span>
                {suggestion.count !== undefined && suggestion.count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {suggestion.count} {suggestion.count === 1 ? 'property' : 'properties'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
