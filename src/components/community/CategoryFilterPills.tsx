import { motion } from 'framer-motion';
import { Hash, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Channel {
  id: string;
  name: string;
  slug: string;
  visibility: 'all_members' | 'elite_only';
}

interface CategoryFilterPillsProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (id: string) => void;
}

export function CategoryFilterPills({ 
  channels, 
  selectedChannelId, 
  onSelectChannel 
}: CategoryFilterPillsProps) {
  const visibleChannels = channels.slice(0, 5);
  const overflowChannels = channels.slice(5);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {/* All Posts Pill */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => channels[0] && onSelectChannel(channels[0].id)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 min-h-[44px]",
          !selectedChannelId
            ? "bg-gold text-background shadow-lg shadow-gold/25"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        )}
      >
        All Posts
      </motion.button>

      {/* Channel Pills */}
      {visibleChannels.map((channel) => (
        <motion.button
          key={channel.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectChannel(channel.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 min-h-[44px]",
            selectedChannelId === channel.id
              ? "bg-gold text-background shadow-lg shadow-gold/25"
              : "bg-muted/50 text-muted-foreground hover:bg-muted",
            channel.visibility === 'elite_only' && "ring-1 ring-gold/30"
          )}
        >
          <Hash className="h-3.5 w-3.5" />
          {channel.name}
        </motion.button>
      ))}

      {/* Overflow Dropdown */}
      {overflowChannels.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-4 py-2.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted min-h-[44px] shrink-0"
            >
              More
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {overflowChannels.map((channel) => (
              <DropdownMenuItem
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={cn(
                  "flex items-center gap-2",
                  selectedChannelId === channel.id && "bg-gold/10 text-gold"
                )}
              >
                <Hash className="h-3.5 w-3.5" />
                {channel.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Filter Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted shrink-0"
      >
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}
