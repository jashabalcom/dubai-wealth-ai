import { useState } from 'react';
import { isSameDay, isFuture, isPast } from 'date-fns';
import { Calendar as CalendarIcon, Clock, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from './EventCard';
import { EventCalendar } from './EventCalendar';
import { useCommunityEvents, CommunityEvent } from '@/hooks/useCommunityEvents';

export function EventsTab() {
  const { events, eventsLoading, register, unregister } = useCommunityEvents();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const upcomingEvents = events.filter((e) => isFuture(new Date(e.event_date)));
  const pastEvents = events.filter((e) => isPast(new Date(e.event_date)));

  const filteredEvents = selectedDate
    ? events.filter((e) => isSameDay(new Date(e.event_date), selectedDate))
    : upcomingEvents;

  if (eventsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/50 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold">Community Events</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('list');
              setSelectedDate(null);
            }}
          >
            <List className="h-4 w-4 mr-1.5" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            Calendar
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EventCalendar
              events={events}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear filter
                  </Button>
                </div>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No events scheduled for this date
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRegister={() => register.mutate(event.id)}
                        onUnregister={() => unregister.mutate(event.id)}
                        isRegistering={register.isPending || unregister.isPending}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No upcoming events scheduled
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={() => register.mutate(event.id)}
                      onUnregister={() => unregister.mutate(event.id)}
                      isRegistering={register.isPending || unregister.isPending}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Clock className="h-4 w-4" />
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card/50 border border-border/50 rounded-xl"
              >
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">
                  Check back soon for new community events!
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => register.mutate(event.id)}
                    onUnregister={() => unregister.mutate(event.id)}
                    isRegistering={register.isPending || unregister.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No past events
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => register.mutate(event.id)}
                    onUnregister={() => unregister.mutate(event.id)}
                    isRegistering={register.isPending || unregister.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
