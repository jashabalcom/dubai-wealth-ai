import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Building2, 
  BarChart3,
  Settings,
  ChevronLeft,
  Shield,
  Calendar,
  DollarSign,
  Target,
  UserCheck,
  Briefcase,
  HardHat,
  MapPin,
  RefreshCw,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Marketing', href: '/admin/marketing', icon: Target },
  { label: 'News', href: '/admin/news', icon: Newspaper },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Bayut Sync', href: '/admin/bayut-sync', icon: RefreshCw },
  { label: 'Neighborhoods', href: '/admin/neighborhoods', icon: MapPin },
  { label: 'Agents', href: '/admin/agents', icon: UserCheck },
  { label: 'Brokerages', href: '/admin/brokerages', icon: Briefcase },
  { label: 'Developers', href: '/admin/developers', icon: HardHat },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Link to="/" className="text-gold hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back to Site</span>
          </Link>
          <div className="mt-4">
            <h1 className="font-heading text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Dubai Wealth Hub</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-gold/20 text-gold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            <span>Admin v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
