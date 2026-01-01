import { useRef, useState, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  overscan = 3,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();
  
  // Calculate rows from items
  const rows = Math.ceil(items.length / columns);
  
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight + gap,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Infinite scroll trigger
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;
    
    const lastRow = virtualRows[virtualRows.length - 1];
    if (!lastRow) return;
    
    // Load more when we're near the end
    if (lastRow.index >= rows - 2) {
      onLoadMore();
    }
  }, [virtualRows, rows, onLoadMore, hasMore, isLoading]);

  return (
    <div
      ref={parentRef}
      className={cn("w-full overflow-auto", className)}
      style={{ height: '100%', maxHeight: 'calc(100vh - 400px)', minHeight: '500px' }}
    >
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
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                  paddingBottom: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) => (
                  <div key={item.id} className="h-fit">
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
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
        </div>
      )}
    </div>
  );
}
