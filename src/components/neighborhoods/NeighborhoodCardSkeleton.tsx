import { Card, CardContent } from '@/components/ui/card';

export function NeighborhoodCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/30 bg-card/60">
      {/* Image Skeleton with Shimmer */}
      <div className="relative h-52 bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
          style={{ backgroundSize: '200% 100%' }}
        />
        
        {/* Badge Placeholders */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-muted-foreground/20" />
          <div className="h-5 w-14 rounded-full bg-muted-foreground/20" />
        </div>
        
        {/* Icon Placeholders */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <div className="h-7 w-7 rounded-full bg-muted-foreground/20" />
          <div className="h-7 w-7 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <div className="h-6 w-3/4 rounded bg-muted mb-2">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        
        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>

        {/* Stats */}
        <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-1">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-1">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
