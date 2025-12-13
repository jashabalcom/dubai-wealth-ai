import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPrefs {
  notify_email_messages: boolean;
  notify_email_connections: boolean;
  notify_email_comments: boolean;
  notify_email_events: boolean;
  notify_inapp_messages: boolean;
  notify_inapp_connections: boolean;
  notify_inapp_comments: boolean;
  notify_inapp_events: boolean;
}

const defaultPrefs: NotificationPrefs = {
  notify_email_messages: true,
  notify_email_connections: true,
  notify_email_comments: true,
  notify_email_events: true,
  notify_inapp_messages: true,
  notify_inapp_connections: true,
  notify_inapp_comments: true,
  notify_inapp_events: true,
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch preferences
  useEffect(() => {
    if (!user?.id) return;

    const fetchPrefs = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          notify_email_messages,
          notify_email_connections,
          notify_email_comments,
          notify_email_events,
          notify_inapp_messages,
          notify_inapp_connections,
          notify_inapp_comments,
          notify_inapp_events
        `)
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setPrefs({
          notify_email_messages: data.notify_email_messages ?? true,
          notify_email_connections: data.notify_email_connections ?? true,
          notify_email_comments: data.notify_email_comments ?? true,
          notify_email_events: data.notify_email_events ?? true,
          notify_inapp_messages: data.notify_inapp_messages ?? true,
          notify_inapp_connections: data.notify_inapp_connections ?? true,
          notify_inapp_comments: data.notify_inapp_comments ?? true,
          notify_inapp_events: data.notify_inapp_events ?? true,
        });
      }
      setIsLoading(false);
    };

    fetchPrefs();
  }, [user?.id]);

  // Update preference
  const updatePref = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!user?.id) return;

    setPrefs(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ [key]: value })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      // Revert on error
      setPrefs(prev => ({ ...prev, [key]: !value }));
      toast({
        title: 'Error saving preferences',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <span className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how and when you want to be notified
          {isSaving && (
            <span className="ml-2 text-xs text-muted-foreground">(Saving...)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">In-App Notifications</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp_messages" className="flex flex-col gap-1">
                <span>Direct Messages</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When someone sends you a message
                </span>
              </Label>
              <Switch
                id="inapp_messages"
                checked={prefs.notify_inapp_messages}
                onCheckedChange={(v) => updatePref('notify_inapp_messages', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp_connections" className="flex flex-col gap-1">
                <span>Connection Requests</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When someone wants to connect with you
                </span>
              </Label>
              <Switch
                id="inapp_connections"
                checked={prefs.notify_inapp_connections}
                onCheckedChange={(v) => updatePref('notify_inapp_connections', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp_comments" className="flex flex-col gap-1">
                <span>Comments & Replies</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When someone comments on your post
                </span>
              </Label>
              <Switch
                id="inapp_comments"
                checked={prefs.notify_inapp_comments}
                onCheckedChange={(v) => updatePref('notify_inapp_comments', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp_events" className="flex flex-col gap-1">
                <span>Events & Announcements</span>
                <span className="text-xs text-muted-foreground font-normal">
                  New events and platform announcements
                </span>
              </Label>
              <Switch
                id="inapp_events"
                checked={prefs.notify_inapp_events}
                onCheckedChange={(v) => updatePref('notify_inapp_events', v)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Email Notifications</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_messages" className="flex flex-col gap-1">
                <span>Direct Messages</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive email when you get a new message
                </span>
              </Label>
              <Switch
                id="email_messages"
                checked={prefs.notify_email_messages}
                onCheckedChange={(v) => updatePref('notify_email_messages', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email_connections" className="flex flex-col gap-1">
                <span>Connection Requests</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive email for new connection requests
                </span>
              </Label>
              <Switch
                id="email_connections"
                checked={prefs.notify_email_connections}
                onCheckedChange={(v) => updatePref('notify_email_connections', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email_comments" className="flex flex-col gap-1">
                <span>Comments & Replies</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive email when someone comments on your post
                </span>
              </Label>
              <Switch
                id="email_comments"
                checked={prefs.notify_email_comments}
                onCheckedChange={(v) => updatePref('notify_email_comments', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email_events" className="flex flex-col gap-1">
                <span>Events & Announcements</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive email for new events and announcements
                </span>
              </Label>
              <Switch
                id="email_events"
                checked={prefs.notify_email_events}
                onCheckedChange={(v) => updatePref('notify_email_events', v)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
