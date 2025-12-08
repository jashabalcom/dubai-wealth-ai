import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  UserCheck, 
  MessagesSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConnections } from '@/hooks/useConnections';
import { useDirectMessages } from '@/hooks/useDirectMessages';

interface CommunitySidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  {
    label: 'Discussions',
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
    label: 'Connections',
    icon: UserCheck,
    path: '/community/connections',
    badgeKey: 'pending',
  },
  {
    label: 'Messages',
    icon: MessagesSquare,
    path: '/community/messages',
    badgeKey: 'unread',
  },
];

export function CommunitySidebar({ collapsed, onToggleCollapse }: CommunitySidebarProps) {
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
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sticky top-28 shadow-xl shadow-black/5">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Collapse Toggle */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      active
                        ? "bg-gold/20 text-gold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      active ? "text-gold" : "group-hover:text-foreground"
                    )} />
                    
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}

                    {badgeCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "h-5 min-w-[20px] px-1.5 text-xs",
                          item.badgeKey === 'pending' 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-gold/20 text-gold",
                          collapsed && "absolute -top-1 -right-1"
                        )}
                      >
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
}
