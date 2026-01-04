import { Flame, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type SortOption = 'hot' | 'top' | 'new';

interface SortingTabsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortingTabs({ value, onChange, className }: SortingTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SortOption)} className={className}>
      <TabsList className="h-9 bg-muted/50 p-1">
        <TabsTrigger 
          value="hot" 
          className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background"
        >
          <Flame className="h-3.5 w-3.5" />
          Hot
        </TabsTrigger>
        <TabsTrigger 
          value="top" 
          className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Top
        </TabsTrigger>
        <TabsTrigger 
          value="new" 
          className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background"
        >
          <Clock className="h-3.5 w-3.5" />
          New
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// Utility function to sort posts by different criteria
export function sortPosts<T extends { 
  created_at: string; 
  upvote_count?: number; 
  likes_count?: number;
  comments_count?: number;
}>(posts: T[], sortBy: SortOption): T[] {
  const now = new Date().getTime();
  
  switch (sortBy) {
    case 'hot':
      // Hot = combination of upvotes and recency
      return [...posts].sort((a, b) => {
        const aScore = (a.upvote_count || a.likes_count || 0) + (a.comments_count || 0);
        const bScore = (b.upvote_count || b.likes_count || 0) + (b.comments_count || 0);
        const aAge = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60); // hours
        const bAge = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
        
        // Hot score = score / (age + 2)^1.5
        const aHot = aScore / Math.pow(aAge + 2, 1.5);
        const bHot = bScore / Math.pow(bAge + 2, 1.5);
        
        return bHot - aHot;
      });
      
    case 'top':
      // Top = highest upvotes
      return [...posts].sort((a, b) => 
        (b.upvote_count || b.likes_count || 0) - (a.upvote_count || a.likes_count || 0)
      );
      
    case 'new':
    default:
      // New = most recent
      return [...posts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}
