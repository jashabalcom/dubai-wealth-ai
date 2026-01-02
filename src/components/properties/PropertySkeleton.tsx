export function PropertyCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="rounded-2xl bg-card border border-border overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image skeleton with shimmer */}
      <div className="aspect-[4/3] w-full skeleton-wave" />
      
      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Investment Score badge area */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 rounded-full skeleton-wave" />
          <div className="h-5 w-16 rounded skeleton-wave" />
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full skeleton-wave" />
          <div className="h-4 w-32 rounded skeleton-wave" />
        </div>
        
        {/* Title */}
        <div className="h-6 w-3/4 rounded skeleton-wave" />
        
        {/* Price */}
        <div className="h-7 w-28 rounded skeleton-wave" />
        
        {/* Features */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="h-4 w-16 rounded skeleton-wave" />
          <div className="h-4 w-12 rounded skeleton-wave" />
          <div className="h-4 w-20 rounded skeleton-wave" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} delay={i * 100} />
      ))}
    </div>
  );
}
