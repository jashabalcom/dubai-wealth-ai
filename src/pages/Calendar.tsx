import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { UpcomingEventsStrip } from "@/components/calendar/UpcomingEventsTicker";
import { AddPersonalEventDialog } from "@/components/calendar/AddPersonalEventDialog";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { UserPropertyEvent } from "@/hooks/useUserPropertyEvents";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, List, Rocket, Building2, Mic2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Calendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<(CalendarEvent | UserPropertyEvent)[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedImportance, setSelectedImportance] = useState<string | null>(null);

  const { data: allEvents = [], isLoading } = useCalendarEvents({
    eventTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    locationArea: selectedLocation || undefined,
    importance: selectedImportance || undefined,
  });

  const handleSelectDate = (date: Date, events: (CalendarEvent | UserPropertyEvent)[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
  };

  // Group events by type for stats
  const eventStats = {
    launches: allEvents.filter(e => e.event_type === 'launch').length,
    handovers: allEvents.filter(e => e.event_type === 'handover').length,
    conferences: allEvents.filter(e => e.event_type === 'conference').length,
    reports: allEvents.filter(e => e.event_type === 'report' || e.event_type === 'economic').length,
  };

  return (
    <>
      <SEOHead
        title="Dubai Real Estate Calendar 2026 | Launches, Handovers & Events"
        description="Stay ahead with Dubai's most comprehensive real estate calendar. Track developer launches, project handovers, industry conferences, and DLD market reports."
      />
      <Navbar />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-luxury">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                  Dubai Real Estate Calendar
                </h1>
                <p className="text-muted-foreground">
                  Track developer launches, handovers, conferences, and market events
                </p>
              </div>
              {user && <AddPersonalEventDialog />}
            </div>

            {/* Upcoming events ticker */}
            <UpcomingEventsStrip className="mb-6" />

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{eventStats.launches}</p>
                    <p className="text-xs text-muted-foreground">Launches</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{eventStats.handovers}</p>
                    <p className="text-xs text-muted-foreground">Handovers</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{eventStats.conferences}</p>
                    <p className="text-xs text-muted-foreground">Conferences</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-500/5 border-purple-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{eventStats.reports}</p>
                    <p className="text-xs text-muted-foreground">Reports</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters and view toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <CalendarFilters
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              selectedImportance={selectedImportance}
              onImportanceChange={setSelectedImportance}
            />
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar/List View */}
            <div className="lg:col-span-2">
              {viewMode === 'calendar' ? (
                <Card>
                  <CardContent className="p-6">
                    <CalendarGrid
                      onSelectDate={handleSelectDate}
                      selectedDate={selectedDate}
                      showUserEvents={!!user}
                    />
                    <CalendarLegend className="mt-6 pt-4 border-t" showUserEvents={!!user} />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading events...</p>
                  ) : allEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No events found</p>
                  ) : (
                    allEvents.map((event) => (
                      <CalendarEventCard key={event.id} event={event} />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Event details panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedDate ? 'No events on this date' : 'Click on a date to see events'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedEvents.map((event) => (
                        <CalendarEventCard
                          key={event.id}
                          event={event as CalendarEvent}
                          variant="compact"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
