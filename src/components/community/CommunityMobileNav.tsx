import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  UserCheck, 
  MessagesSquare 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConnections } from '@/hooks/useConnections';
import { useDirectMessages } from '@/hooks/useDirectMessages';

const navItems = [
  {
    label: 'Discuss',
    icon: MessageSquare,
    path: '/community',
    exact: true,
  },
  {
    label: 'Events',
    icon: Calendar,
    path: '/community/events',
  },
  {
    label: 'Members',
    icon: Users,
    path: '/community/members',
  },
  {
    label: 'Connect',
    icon: UserCheck,
    path: '/community/connections',
    badgeKey: 'pending',
  },
  {
    label: 'Chat',
    icon: MessagesSquare,
    path: '/community/messages',
    badgeKey: 'unread',
  },
];

export function CommunityMobileNav() {
  const location = useLocation();
  const { pendingCount } = useConnections();
  const { unreadCount } = useDirectMessages();

  const getBadgeCount = (key?: string) => {
    if (key === 'pending') return pendingCount;
    if (key === 'unread') return unreadCount;
    return 0;
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          const badgeCount = getBadgeCount(item.badgeKey);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative",
                active ? "text-gold" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {badgeCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px]",
                      item.badgeKey === 'pending' 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-gold text-primary-foreground"
                    )}
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
