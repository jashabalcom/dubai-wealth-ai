import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useUserPropertyEventMutations, UserPropertyEvent } from "@/hooks/useUserPropertyEvents";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";
import { eventTypeLabels } from "./CalendarEventDot";

interface AddPersonalEventDialogProps {
  defaultDate?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const userEventTypes = ['service_charge', 'rental_renewal', 'mortgage_payment', 'inspection', 'visa_renewal', 'custom'];

export function AddPersonalEventDialog({ defaultDate, trigger, onSuccess }: AddPersonalEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [eventType, setEventType] = useState<string>("custom");
  const [eventDate, setEventDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [portfolioPropertyId, setPortfolioPropertyId] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState(7);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string | null>(null);

  const { createEvent } = useUserPropertyEventMutations();
  const { properties } = usePortfolio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        notes: notes.trim() || null,
        event_type: eventType as UserPropertyEvent['event_type'],
        event_date: eventDate,
        portfolio_property_id: portfolioPropertyId,
        reminder_days_before: reminderDays,
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? recurrenceInterval as UserPropertyEvent['recurrence_interval'] : null,
        is_completed: false,
      });

      toast.success("Event added to your calendar");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setEventType("custom");
    setEventDate(new Date().toISOString().split('T')[0]);
    setPortfolioPropertyId(null);
    setReminderDays(7);
    setIsRecurring(false);
    setRecurrenceInterval(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Personal Event</DialogTitle>
          <DialogDescription>
            Track important dates for your properties like service charges, renewals, and inspections.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual service charge due"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {eventTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          {properties && properties.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="property">Link to Property (Optional)</Label>
              <Select
                value={portfolioPropertyId || 'none'}
                onValueChange={(v) => setPortfolioPropertyId(v === 'none' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No property</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.property_name || property.location_area || 'Property'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring" className="text-sm">Recurring event</Label>
            </div>

            {isRecurring && (
              <Select
                value={recurrenceInterval || 'yearly'}
                onValueChange={setRecurrenceInterval}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
