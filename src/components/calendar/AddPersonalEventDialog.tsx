import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUserPropertyEventMutations, UserPropertyEvent } from "@/hooks/useUserPropertyEvents";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";
import { eventTypeLabels } from "./CalendarEventDot";
import { cn } from "@/lib/utils";

interface AddPersonalEventDialogProps {
  defaultDate?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const userEventTypes = ['service_charge', 'rental_renewal', 'mortgage_payment', 'inspection', 'visa_renewal', 'custom'];

export function AddPersonalEventDialog({ defaultDate, trigger, onSuccess }: AddPersonalEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [notes, setNotes] = useState("");
  const [eventType, setEventType] = useState<string>("custom");
  const [eventDate, setEventDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [portfolioPropertyId, setPortfolioPropertyId] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState(7);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { createEvent } = useUserPropertyEventMutations();
  const { properties } = usePortfolio();

  // Auto-focus title input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Check if date is in the past
  const isPastDate = new Date(eventDate) < new Date(new Date().toDateString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");

    if (!title.trim()) {
      setTitleError("Please enter an event title");
      titleInputRef.current?.focus();
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

      // Show success animation
      setShowSuccess(true);
      toast.success("Event added to your calendar");
      
      setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
        resetForm();
        onSuccess?.();
      }, 800);
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTitleError("");
    setNotes("");
    setEventType("custom");
    setEventDate(new Date().toISOString().split('T')[0]);
    setPortfolioPropertyId(null);
    setReminderDays(7);
    setIsRecurring(false);
    setRecurrenceInterval(null);
    setShowSuccess(false);
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
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <p className="text-lg font-medium text-foreground">Event Added!</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>Add Personal Event</DialogTitle>
                <DialogDescription>
                  Track important dates for your properties like service charges, renewals, and inspections.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className={cn(titleError && "text-destructive")}>
                    Event Title
                  </Label>
                  <Input
                    ref={titleInputRef}
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError("");
                    }}
                    placeholder="e.g., Annual service charge due"
                    className={cn(titleError && "border-destructive focus-visible:ring-destructive")}
                  />
                  <AnimatePresence>
                    {titleError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="text-xs text-destructive"
                      >
                        {titleError}
                      </motion.p>
                    )}
                  </AnimatePresence>
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
                      className={cn(isPastDate && "border-amber-500")}
                    />
                    {isPastDate && (
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <AlertTriangle className="w-3 h-3" />
                        Past date
                      </div>
                    )}
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
                    maxLength={500}
                    showCharCount
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

                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createEvent.isPending} loadingText="Adding...">
                    Add Event
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
