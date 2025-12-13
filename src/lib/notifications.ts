import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'message'
  | 'connection_request'
  | 'connection_accepted'
  | 'post_comment'
  | 'event_new'
  | 'event_reminder'
  | 'announcement';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotification({
  userId,
  type,
  title,
  body,
  link,
  metadata,
}: SendNotificationParams): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        user_id: userId,
        type,
        title,
        body,
        link,
        metadata,
      },
    });

    if (error) {
      console.error('Error sending notification:', error);
    }
  } catch (error) {
    console.error('Error invoking send-notification:', error);
  }
}
