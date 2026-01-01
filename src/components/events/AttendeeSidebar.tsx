import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Attendee {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  membership_tier: string;
  is_host?: boolean;
  is_speaking?: boolean;
}

interface AttendeeSidebarProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  hostId?: string;
}

export function AttendeeSidebar({ eventId, isOpen, onClose, hostId }: AttendeeSidebarProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendees() {
      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select(`
            id,
            user_id,
            profiles:user_id (
              full_name,
              avatar_url,
              membership_tier
            )
          `)
          .eq('event_id', eventId)
          .eq('status', 'registered');

        if (error) throw error;

        const formattedAttendees: Attendee[] = (data || []).map((reg: any) => ({
          id: reg.id,
          user_id: reg.user_id,
          full_name: reg.profiles?.full_name || 'Anonymous',
          avatar_url: reg.profiles?.avatar_url,
          membership_tier: reg.profiles?.membership_tier || 'free',
          is_host: reg.user_id === hostId,
        }));

        // Sort: host first, then elite, then others
        formattedAttendees.sort((a, b) => {
          if (a.is_host) return -1;
          if (b.is_host) return 1;
          if (a.membership_tier === 'elite' && b.membership_tier !== 'elite') return -1;
          if (b.membership_tier === 'elite' && a.membership_tier !== 'elite') return 1;
          return a.full_name.localeCompare(b.full_name);
        });

        setAttendees(formattedAttendees);
      } catch (err) {
        console.error('Failed to fetch attendees:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchAttendees();
    }
  }, [eventId, isOpen, hostId]);

  const filteredAttendees = attendees.filter(a => 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-80 h-full glass-dark border-r border-gold/10 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gold/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              <span className="font-medium text-pearl">
                Attendees ({attendees.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-pearl hover:text-gold hover:bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-gold/20 focus:border-gold text-pearl"
              />
            </div>
          </div>

          {/* Attendee list */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 pb-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-muted/30" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-24 bg-muted/30 rounded" />
                        <div className="h-2 w-16 bg-muted/20 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAttendees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? 'No attendees found' : 'No attendees yet'}
                </p>
              ) : (
                filteredAttendees.map((attendee) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gold/5 ${
                      attendee.is_speaking ? 'ring-2 ring-gold ring-offset-2 ring-offset-secondary' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className={`h-10 w-10 ${
                        attendee.membership_tier === 'elite' ? 'ring-2 ring-gold' : ''
                      }`}>
                        <AvatarImage src={attendee.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold/20 text-gold">
                          {attendee.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {attendee.is_speaking && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-secondary"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-pearl font-medium truncate">
                          {attendee.full_name}
                        </span>
                        {attendee.is_host && (
                          <Crown className="h-4 w-4 text-gold flex-shrink-0" />
                        )}
                      </div>
                      {attendee.membership_tier === 'elite' && (
                        <Badge variant="secondary" className="bg-gold/20 text-gold text-[10px] px-1.5 py-0">
                          Elite
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
