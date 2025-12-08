import { Hash, Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'all_members' | 'elite_only';
  order_index: number;
}

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (id: string) => void;
}

export function ChannelList({ channels, selectedChannelId, onSelectChannel }: ChannelListProps) {
  const regularChannels = channels.filter(c => c.visibility === 'all_members');
  const eliteChannels = channels.filter(c => c.visibility === 'elite_only');

  return (
    <div className="space-y-6">
      {/* Regular Channels */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
          Channels
        </h3>
        <div className="space-y-1">
          {regularChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                selectedChannelId === channel.id
                  ? "bg-gold/20 text-gold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Hash className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Elite Channels */}
      {eliteChannels.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 px-2 flex items-center gap-2">
            <Crown className="h-3 w-3" />
            Elite Only
          </h3>
          <div className="space-y-1">
            {eliteChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                  selectedChannelId === channel.id
                    ? "bg-gold/20 text-gold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Lock className="h-4 w-4 flex-shrink-0 text-gold" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
