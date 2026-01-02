import { useRef, useState, useEffect, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimatedItemHeight: number;
  gap?: number;
  className?: string;
  overscan?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

function useResponsiveColumns() {
  const [columns, setColumns] = useState(1);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setColumns(3); // lg
      } else if (width >= 768) {
        setColumns(2); // md
      } else {
        setColumns(1); // sm
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  return columns;
}

export function VirtualGrid<T extends { id: string }>({
  items,
  renderItem,
  estimatedItemHeight,
  gap = 24,
  className,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: VirtualGridProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();
  
  // Calculate rows from items
  const rows = Math.ceil(items.length / columns);
  
  // Use window-based virtualizer for natural page scrolling
  const virtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => estimatedItemHeight + gap,
    overscan,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Infinite scroll trigger
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;
    
    const lastRow = virtualRows[virtualRows.length - 1];
    if (!lastRow) return;
    
    // Load more when we're near the end
    if (lastRow.index >= rows - 3) {
      onLoadMore();
    }
  }, [virtualRows, rows, onLoadMore, hasMore, isLoading]);

  return (
    <div ref={listRef} className={cn("w-full", className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columns;
          const rowItems = items.slice(rowStartIndex, rowStartIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                  paddingBottom: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) => (
                  <div key={item.id}>
                    {renderItem(item, rowStartIndex + colIndex)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent" />
            <span className="text-sm">Loading more properties...</span>
          </div>
        </div>
      )}
      
      {/* End of results */}
      {!hasMore && items.length > 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Showing all {items.length} properties
        </div>
      )}
    </div>
  );
}
