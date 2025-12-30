import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Rocket, 
  Home, 
  Building2, 
  FileText, 
  Gavel, 
  TrendingUp,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const eventTypes = [
  { value: 'launch', label: 'Project Launch', icon: Rocket, color: 'text-green-500' },
  { value: 'handover', label: 'Handover', icon: Home, color: 'text-blue-500' },
  { value: 'conference', label: 'Conference', icon: Building2, color: 'text-purple-500' },
  { value: 'report', label: 'Report Release', icon: FileText, color: 'text-amber-500' },
  { value: 'regulatory', label: 'Regulatory', icon: Gavel, color: 'text-red-500' },
  { value: 'economic', label: 'Economic', icon: TrendingUp, color: 'text-cyan-500' },
];

const importanceLevels = [
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-500' },
  { value: 'normal', label: 'Normal', color: 'bg-muted text-muted-foreground' },
  { value: 'low', label: 'Low', color: 'bg-muted/50 text-muted-foreground' },
];

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  event_date: Date | undefined;
  end_date: Date | undefined;
  location_area: string;
  project_name: string;
  importance: string;
  external_url: string;
  image_url: string;
  is_published: boolean;
}

const defaultFormData: EventFormData = {
  title: '',
  description: '',
  event_type: 'launch',
  event_date: undefined,
  end_date: undefined,
  location_area: '',
  project_name: '',
  importance: 'normal',
  external_url: '',
  image_url: '',
  is_published: true,
};

export default function AdminCalendarEvents() {
  const { toast } = useToast();
  const { createEvent, updateEvent, deleteEvent } = useAdminCalendarEvents();
  
  // Filters state
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);

  // Fetch all events (including unpublished for admin)
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-calendar-events', filterEventType, filterStartDate, filterEndDate],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (filterEventType && filterEventType !== 'all') {
        query = query.eq('event_type', filterEventType);
      }

      if (filterStartDate) {
        query = query.gte('event_date', format(filterStartDate, 'yyyy-MM-dd'));
      }

      if (filterEndDate) {
        query = query.lte('event_date', format(filterEndDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        event_date: new Date(event.event_date),
        end_date: event.end_date ? new Date(event.end_date) : undefined,
        location_area: event.location_area || '',
        project_name: event.project_name || '',
        importance: event.importance || 'normal',
        external_url: event.external_url || '',
        image_url: event.image_url || '',
        is_published: event.is_published,
      });
    } else {
      setEditingEvent(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in title and event date',
        variant: 'destructive',
      });
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type as CalendarEvent['event_type'],
        event_date: format(formData.event_date, 'yyyy-MM-dd'),
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        location_area: formData.location_area || null,
        project_name: formData.project_name || null,
        importance: formData.importance as 'high' | 'normal' | 'low',
        external_url: formData.external_url || null,
        image_url: formData.image_url || null,
        is_published: formData.is_published,
        developer_id: null,
      };

      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, ...eventData });
        toast({ title: 'Event updated successfully' });
      } else {
        await createEvent.mutateAsync(eventData as Omit<CalendarEvent, 'id' | 'created_at'>);
        toast({ title: 'Event created successfully' });
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormData(defaultFormData);
    } catch (error) {
      toast({
        title: 'Error saving event',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmEvent) return;
    try {
      await deleteEvent.mutateAsync(deleteConfirmEvent.id);
      toast({ title: 'Event deleted' });
      setDeleteConfirmEvent(null);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setFilterEventType('all');
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
  };

  const hasActiveFilters = filterEventType !== 'all' || filterStartDate || filterEndDate;

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getImportanceBadge = (importance: string) => {
    const level = importanceLevels.find(l => l.value === importance) || importanceLevels[1];
    return <Badge className={level.color}>{level.label}</Badge>;
  };

  return (
    <AdminLayout title="Calendar Events">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Manage Dubai real estate market events, launches, and handovers
        </p>
        <Button onClick={() => handleOpenDialog()} className="bg-gold hover:bg-gold/90 text-background">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Event Type Filter */}
          <div className="w-48">
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-40 justify-start text-left font-normal', !filterStartDate && 'text-muted-foreground')}>
                <Calendar className="mr-2 h-4 w-4" />
                {filterStartDate ? format(filterStartDate, 'MMM d, yyyy') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filterStartDate}
                onSelect={setFilterStartDate}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* End Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-40 justify-start text-left font-normal', !filterEndDate && 'text-muted-foreground')}>
                <Calendar className="mr-2 h-4 w-4" />
                {filterEndDate ? format(filterEndDate, 'MMM d, yyyy') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filterEndDate}
                onSelect={setFilterEndDate}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Importance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-12 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No events found. Create your first event!
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const typeInfo = getEventTypeInfo(event.event_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.project_name && (
                          <div className="text-xs text-muted-foreground">{event.project_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className={cn('h-4 w-4', typeInfo.color)} />
                        <span className="text-sm">{typeInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </div>
                      {event.end_date && (
                        <div className="text-xs text-muted-foreground">
                          → {format(new Date(event.end_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {event.location_area || '—'}
                      </span>
                    </TableCell>
                    <TableCell>{getImportanceBadge(event.importance)}</TableCell>
                    <TableCell>
                      {event.is_published ? (
                        <Badge className="bg-green-500/20 text-green-500">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {event.external_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(event.external_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmEvent(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sobha Hartland II Phase 3 Launch"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event details..."
                rows={3}
              />
            </div>

            {/* Event Type & Importance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={cn('h-4 w-4', type.color)} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Importance</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(value) => setFormData({ ...formData, importance: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {importanceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.event_date && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.event_date ? format(formData.event_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.event_date}
                      onSelect={(date) => setFormData({ ...formData, event_date: date })}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.end_date && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Location & Project */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location Area</Label>
                <Input
                  id="location"
                  value={formData.location_area}
                  onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                  placeholder="e.g., Dubai Marina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project Name</Label>
                <Input
                  id="project"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="e.g., Sobha Hartland II"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="external_url">External URL</Label>
                <Input
                  id="external_url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="published" className="text-base">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this event visible to users
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createEvent.isPending || updateEvent.isPending}
              className="bg-gold hover:bg-gold/90 text-background"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmEvent} onOpenChange={() => setDeleteConfirmEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
