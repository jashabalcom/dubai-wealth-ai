import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Calendar, Video, Users, Crown, ExternalLink, Radio } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminEvents, CommunityEvent } from '@/hooks/useCommunityEvents';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const eventTypes = [
  { value: 'webinar', label: 'Webinar' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'ama', label: 'AMA Session' },
];

const platforms = [
  { value: 'jitsi_embedded', label: 'Embedded Meeting (Jitsi)' },
  { value: 'zoom_embedded', label: 'Embedded Zoom (SDK)' },
  { value: 'zoom', label: 'Zoom (External Link)' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'other', label: 'Other' },
];

const durations = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

interface EventFormData {
  title: string;
  description: string;
  event_date: Date | undefined;
  event_time: string;
  duration_minutes: number;
  event_type: string;
  meeting_platform: string;
  meeting_url: string;
  meeting_id: string;
  visibility: 'all_members' | 'elite_only';
  max_attendees: string;
  is_published: boolean;
  recording_url: string;
  recording_visible: boolean;
  recording_access: 'all_members' | 'elite_only';
  zoom_meeting_number: string;
  zoom_password: string;
}

const defaultFormData: EventFormData = {
  title: '',
  description: '',
  event_date: undefined,
  event_time: '10:00',
  duration_minutes: 60,
  event_type: 'webinar',
  meeting_platform: 'jitsi_embedded',
  meeting_url: '',
  meeting_id: '',
  visibility: 'all_members',
  max_attendees: '',
  is_published: false,
  recording_url: '',
  recording_visible: false,
  recording_access: 'all_members',
  zoom_meeting_number: '',
  zoom_password: '',
};

export default function AdminEvents() {
  const { user } = useAuth();
  const { events, eventsLoading, createEvent, updateEvent, deleteEvent } = useAdminEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CommunityEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);

  const handleOpenDialog = (event?: CommunityEvent) => {
    if (event) {
      const eventDate = new Date(event.event_date);
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: eventDate,
        event_time: format(eventDate, 'HH:mm'),
        duration_minutes: event.duration_minutes,
        event_type: event.event_type,
        meeting_platform: event.meeting_platform,
        meeting_url: event.meeting_url || '',
        meeting_id: event.meeting_id || '',
        visibility: event.visibility,
        max_attendees: event.max_attendees?.toString() || '',
        is_published: event.is_published,
        recording_url: event.recording_url || '',
        recording_visible: event.recording_visible,
        recording_access: event.recording_access,
        zoom_meeting_number: (event as any).zoom_meeting_number || '',
        zoom_password: (event as any).zoom_password || '',
      });
    } else {
      setEditingEvent(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date || !user) return;

    const [hours, minutes] = formData.event_time.split(':').map(Number);
    const eventDateTime = new Date(formData.event_date);
    eventDateTime.setHours(hours, minutes, 0, 0);

    const eventData: any = {
      title: formData.title,
      description: formData.description || null,
      event_date: eventDateTime.toISOString(),
      duration_minutes: formData.duration_minutes,
      event_type: formData.event_type,
      meeting_platform: formData.meeting_platform,
      meeting_url: formData.meeting_url || null,
      meeting_id: formData.meeting_id || null,
      cover_image_url: null,
      visibility: formData.visibility,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      is_published: formData.is_published,
      is_live: false,
      created_by: user.id,
      recording_url: formData.recording_url || null,
      recording_visible: formData.recording_visible,
      recording_access: formData.recording_access,
      zoom_meeting_number: formData.zoom_meeting_number || null,
      zoom_password: formData.zoom_password || null,
    };

    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...eventData });
    } else {
      await createEvent.mutateAsync(eventData);
    }

    setIsDialogOpen(false);
    setEditingEvent(null);
    setFormData(defaultFormData);
  };

  const handleDelete = async () => {
    if (!deleteConfirmEvent) return;
    await deleteEvent.mutateAsync(deleteConfirmEvent.id);
    setDeleteConfirmEvent(null);
  };

  const handleToggleLive = async (event: CommunityEvent) => {
    await updateEvent.mutateAsync({ 
      id: event.id, 
      is_live: !event.is_live 
    });
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'jitsi_embedded':
        return <Badge variant="outline" className="border-green-500/50 text-green-500">Embedded (Jitsi)</Badge>;
      case 'zoom_embedded':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500">Embedded (Zoom)</Badge>;
      case 'zoom':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-500">Zoom</Badge>;
      case 'google_meet':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Google Meet</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <AdminLayout title="Community Events">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground">
            Schedule and manage community events, webinars, and meetups
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gold hover:bg-gold/90 text-background">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-12 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No events created yet. Create your first event!
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {event.event_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">
                          {format(new Date(event.event_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), 'h:mm a')} · {event.duration_minutes}min
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlatformBadge(event.meeting_platform)}</TableCell>
                  <TableCell>
                    {event.visibility === 'elite_only' ? (
                      <Badge className="bg-gold/20 text-gold gap-1">
                        <Crown className="h-3 w-3" />
                        Elite
                      </Badge>
                    ) : (
                      <Badge variant="secondary">All Members</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.registrations_count}</span>
                      {event.max_attendees && (
                        <span className="text-muted-foreground">/ {event.max_attendees}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {event.is_live && (
                        <Badge className="bg-red-500 text-white gap-1 animate-pulse">
                          <Radio className="h-3 w-3" />
                          LIVE
                        </Badge>
                      )}
                      {event.is_published ? (
                        <Badge className="bg-green-500/20 text-green-500">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Go Live Toggle */}
                      {event.is_published && event.meeting_url && (
                        <Button
                          variant={event.is_live ? "destructive" : "default"}
                          size="sm"
                          className={event.is_live ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}
                          onClick={() => handleToggleLive(event)}
                        >
                          <Radio className="h-3 w-3 mr-1" />
                          {event.is_live ? 'End Live' : 'Go Live'}
                        </Button>
                      )}
                      {event.meeting_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(event.meeting_url!, '_blank')}
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
              ))
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
                placeholder="e.g., Dubai Real Estate Investment Webinar"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what attendees will learn..."
                rows={3}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
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
                      {formData.event_date
                        ? format(formData.event_date, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.event_date}
                      onSelect={(date) => setFormData({ ...formData, event_date: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time">Event Time *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>
            </div>

            {/* Duration & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Event Type</Label>
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
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meeting Platform & URL */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                Meeting Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.meeting_platform}
                    onValueChange={(value) => setFormData({ ...formData, meeting_platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_id">Meeting ID (optional)</Label>
                  <Input
                    id="meeting_id"
                    value={formData.meeting_id}
                    onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                    placeholder="e.g., 123-456-789"
                  />
                </div>
              </div>

              {/* Meeting URL - for external link platforms */}
              {formData.meeting_platform !== 'jitsi_embedded' && formData.meeting_platform !== 'zoom_embedded' && (
                <div className="space-y-2">
                  <Label htmlFor="meeting_url">Meeting URL</Label>
                  <Input
                    id="meeting_url"
                    value={formData.meeting_url}
                    onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                    placeholder="Paste your Zoom or Google Meet link here"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create your meeting in {formData.meeting_platform === 'zoom' ? 'Zoom' : formData.meeting_platform === 'google_meet' ? 'Google Calendar' : 'your platform'} and paste the invite link here
                  </p>
                </div>
              )}

              {/* Zoom SDK fields - only for zoom_embedded */}
              {formData.meeting_platform === 'zoom_embedded' && (
                <div className="space-y-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400">
                    Create a meeting in your Zoom account and enter the details below
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zoom_meeting_number">Zoom Meeting Number *</Label>
                      <Input
                        id="zoom_meeting_number"
                        value={formData.zoom_meeting_number}
                        onChange={(e) => setFormData({ ...formData, zoom_meeting_number: e.target.value })}
                        placeholder="123 456 7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zoom_password">Meeting Passcode</Label>
                      <Input
                        id="zoom_password"
                        value={formData.zoom_password}
                        onChange={(e) => setFormData({ ...formData, zoom_password: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Jitsi info */}
              {formData.meeting_platform === 'jitsi_embedded' && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400">
                    A meeting room will be automatically created when the event goes live. No external configuration needed.
                  </p>
                </div>
              )}
            </div>

            {/* Visibility & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: 'all_members' | 'elite_only') => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_members">All Members</SelectItem>
                    <SelectItem value="elite_only">Elite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees (optional)</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="is_published">Publish Event</Label>
                <p className="text-xs text-muted-foreground">
                  Make this event visible to members
                </p>
              </div>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>

            {/* Recording Section - for past events */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-gold/20">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-gold" />
                Event Recording
              </h4>
              <p className="text-xs text-muted-foreground">
                Add a recording URL after the event ends for members to watch replays
              </p>

              <div className="space-y-2">
                <Label htmlFor="recording_url">Recording URL</Label>
                <Input
                  id="recording_url"
                  value={formData.recording_url}
                  onChange={(e) => setFormData({ ...formData, recording_url: e.target.value })}
                  placeholder="YouTube, Vimeo, or direct video URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recording Access</Label>
                  <Select
                    value={formData.recording_access}
                    onValueChange={(value: 'all_members' | 'elite_only') => setFormData({ ...formData, recording_access: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_members">Investor & Elite</SelectItem>
                      <SelectItem value="elite_only">Elite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <Label htmlFor="recording_visible" className="text-sm">Show Recording</Label>
                    <p className="text-xs text-muted-foreground">
                      Make visible to members
                    </p>
                  </div>
                  <Switch
                    id="recording_visible"
                    checked={formData.recording_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, recording_visible: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.event_date || createEvent.isPending || updateEvent.isPending}
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
              Are you sure you want to delete "{deleteConfirmEvent?.title}"? This action cannot be undone and will remove all registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
