import { Loader2 } from "lucide-react";

export function LazyLoadFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
