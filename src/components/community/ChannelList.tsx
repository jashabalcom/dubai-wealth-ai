import { Hash, Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {regularChannels.map((channel) => (
            <motion.button
              key={channel.id}
              variants={itemVariants}
              onClick={() => onSelectChannel(channel.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group",
                selectedChannelId === channel.id
                  ? "bg-gold/15 text-gold shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {selectedChannelId === channel.id && (
                <motion.div
                  layoutId="activeChannel"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                selectedChannelId === channel.id ? "bg-gold/20" : "bg-muted/50 group-hover:bg-muted"
              )}>
                <Hash className="h-3.5 w-3.5 flex-shrink-0" />
              </div>
              <span className="truncate font-medium text-sm">{channel.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Elite Channels */}
      {eliteChannels.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 px-2 flex items-center gap-2">
            <Crown className="h-3 w-3" />
            Elite Only
          </h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {eliteChannels.map((channel) => (
              <motion.button
                key={channel.id}
                variants={itemVariants}
                onClick={() => onSelectChannel(channel.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group",
                  selectedChannelId === channel.id
                    ? "bg-gold/15 text-gold shadow-sm shadow-gold/10"
                    : "text-muted-foreground hover:bg-gold/5 hover:text-gold/80"
                )}
              >
                {selectedChannelId === channel.id && (
                  <motion.div
                    layoutId="activeChannel"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold rounded-r-full shadow-lg shadow-gold/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors relative overflow-hidden",
                  selectedChannelId === channel.id ? "bg-gold/20" : "bg-gold/10 group-hover:bg-gold/15"
                )}>
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                <span className="truncate font-medium text-sm">{channel.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}