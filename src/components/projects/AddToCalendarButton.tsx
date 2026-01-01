import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, Check, Bell, BellOff, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  useIsProjectSaved, 
  useSaveProject, 
  useUnsaveProject,
  useUpdateSavedProject,
  type ProjectWithDetails 
} from '@/hooks/useProject';
import { format } from 'date-fns';

interface AddToCalendarButtonProps {
  project: ProjectWithDetails;
  variant?: 'default' | 'hero' | 'compact';
}

export function AddToCalendarButton({ project, variant = 'default' }: AddToCalendarButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifyLaunch, setNotifyLaunch] = useState(true);
  const [notifyHandover, setNotifyHandover] = useState(true);
  const [notes, setNotes] = useState('');

  const { data: savedProject, isLoading: isCheckingStatus } = useIsProjectSaved(project.id);
  const saveProject = useSaveProject();
  const unsaveProject = useUnsaveProject();
  const updateSavedProject = useUpdateSavedProject();

  const isSaved = !!savedProject;
  const isLoading = saveProject.isPending || unsaveProject.isPending || updateSavedProject.isPending;

  const handleClick = () => {
    if (!user) {
      toast.info('Please sign in to track projects');
      navigate('/auth');
      return;
    }

    if (isSaved) {
      // Already saved - open sheet to manage
      setNotifyLaunch(savedProject.notify_on_launch);
      setNotifyHandover(savedProject.notify_on_handover);
      setNotes(savedProject.notes || '');
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await updateSavedProject.mutateAsync({
          projectId: project.id,
          notifyOnLaunch: notifyLaunch,
          notifyOnHandover: notifyHandover,
          notes,
        });
        toast.success('Calendar preferences updated');
      } else {
        await saveProject.mutateAsync({
          projectId: project.id,
          notifyOnLaunch: notifyLaunch,
          notifyOnHandover: notifyHandover,
          notes,
        });
        toast.success('Project added to your calendar');
      }
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleRemove = async () => {
    try {
      await unsaveProject.mutateAsync(project.id);
      toast.success('Project removed from calendar');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to remove project');
    }
  };

  const buttonClasses = {
    default: 'gap-2',
    hero: 'gap-2 bg-primary text-primary-foreground hover:bg-primary/90',
    compact: 'h-9 w-9 p-0',
  };

  return (
    <>
      <Button
        variant={variant === 'hero' ? 'default' : isSaved ? 'secondary' : 'outline'}
        className={buttonClasses[variant]}
        onClick={handleClick}
        disabled={isCheckingStatus}
      >
        {isCheckingStatus ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <>
            <Check className="h-4 w-4" />
            {variant !== 'compact' && 'Tracking'}
          </>
        ) : (
          <>
            <CalendarPlus className="h-4 w-4" />
            {variant !== 'compact' && 'Add to Calendar'}
          </>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif text-xl">
              {isSaved ? 'Manage Project' : 'Add to Calendar'}
            </SheetTitle>
            <SheetDescription>
              Track important dates for {project.name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Project Summary */}
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              {project.image_url && (
                <img 
                  src={project.image_url} 
                  alt={project.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                {project.developer && (
                  <p className="text-sm text-muted-foreground">by {project.developer.name}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{project.location_area}</p>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Notify me about</h4>

              {project.launch_date && (
                <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id="notify-launch"
                    checked={notifyLaunch}
                    onCheckedChange={(checked) => setNotifyLaunch(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="notify-launch" className="font-medium cursor-pointer">
                      Launch Date
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(project.launch_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  {notifyLaunch ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}

              {project.handover_date && (
                <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id="notify-handover"
                    checked={notifyHandover}
                    onCheckedChange={(checked) => setNotifyHandover(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="notify-handover" className="font-medium cursor-pointer">
                      Handover Date
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(project.handover_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  {notifyHandover ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}

              {!project.launch_date && !project.handover_date && (
                <p className="text-sm text-muted-foreground italic">
                  No dates have been announced yet. We'll notify you when dates are confirmed.
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Personal Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this project..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSaved ? 'Update Preferences' : 'Save to Calendar'}
              </Button>

              {isSaved && (
                <Button 
                  variant="ghost" 
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove from Calendar
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
