import { BrandedLoader } from "@/components/ui/branded-loader";

export function LazyLoadFallback() {
  return <BrandedLoader variant="fullscreen" size="lg" text="Loading..." />;
}
