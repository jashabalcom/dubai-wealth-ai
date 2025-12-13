import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  Bell,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="w-4 h-4" />;
    case 'connection_request':
      return <UserPlus className="w-4 h-4" />;
    case 'connection_accepted':
      return <UserCheck className="w-4 h-4" />;
    case 'post_comment':
      return <MessageSquare className="w-4 h-4" />;
    case 'event_new':
    case 'event_reminder':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'message':
      return 'bg-blue-500/10 text-blue-500';
    case 'connection_request':
    case 'connection_accepted':
      return 'bg-green-500/10 text-green-500';
    case 'post_comment':
      return 'bg-purple-500/10 text-purple-500';
    case 'event_new':
    case 'event_reminder':
      return 'bg-gold/10 text-gold';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function NotificationItem({ 
  notification, 
  onRead, 
  onDelete,
  onClose 
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (onClose) {
      onClose();
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors relative group",
        notification.is_read 
          ? "bg-transparent hover:bg-muted/50" 
          : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        getNotificationColor(notification.type)
      )}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
        )}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className="w-full text-left">
      {content}
    </button>
  );
}
