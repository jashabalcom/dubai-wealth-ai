import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, GraduationCap, Building2, DollarSign, TrendingUp, UserCheck, 
  ArrowUpRight, Clock, UserPlus, CreditCard, MessageSquare, Target 
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data: revenueStats, isLoading: revenueLoading } = useAdminRevenue();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: investorMembers },
        { count: eliteMembers },
        { count: totalCourses },
        { count: totalProperties },
        { count: goldenVisaSubmissions },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_tier', 'investor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_tier', 'elite'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('golden_visa_submissions').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: totalUsers || 0,
        investorMembers: investorMembers || 0,
        eliteMembers: eliteMembers || 0,
        totalCourses: totalCourses || 0,
        totalProperties: totalProperties || 0,
        goldenVisaSubmissions: goldenVisaSubmissions || 0,
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const [
        { data: recentUsers },
        { data: recentLeads },
        { data: recentPosts },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, created_at, membership_tier').order('created_at', { ascending: false }).limit(5),
        supabase.from('golden_visa_submissions').select('id, full_name, email, created_at, investment_budget').order('created_at', { ascending: false }).limit(5),
        supabase.from('community_posts').select('id, title, created_at, user_id').order('created_at', { ascending: false }).limit(5),
      ]);

      const activities: Array<{ type: string; title: string; subtitle: string; time: string; icon: typeof UserPlus }> = [];

      recentUsers?.forEach((user) => {
        activities.push({
          type: 'signup',
          title: user.full_name || user.email || 'New User',
          subtitle: `Joined as ${user.membership_tier}`,
          time: user.created_at,
          icon: UserPlus,
        });
      });

      recentLeads?.forEach((lead) => {
        activities.push({
          type: 'lead',
          title: lead.full_name,
          subtitle: `Golden Visa Lead - ${lead.investment_budget}`,
          time: lead.created_at,
          icon: Target,
        });
      });

      recentPosts?.forEach((post) => {
        activities.push({
          type: 'post',
          title: post.title,
          subtitle: 'New community post',
          time: post.created_at,
          icon: MessageSquare,
        });
      });

      // Sort by time and take top 10
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    },
  });

  const isLoading = statsLoading || revenueLoading;

  const kpiCards = [
    { 
      label: 'MRR', 
      value: `$${(revenueStats?.mrr || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-gold',
      link: '/admin/revenue'
    },
    { 
      label: 'ARR', 
      value: `$${(revenueStats?.arr || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-emerald-500',
      link: '/admin/revenue'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'text-blue-500',
      link: '/admin/users'
    },
    { 
      label: 'Paying Subscribers', 
      value: revenueStats?.totalSubscribers || 0, 
      icon: CreditCard, 
      color: 'text-purple-500',
      link: '/admin/revenue'
    },
  ];

  const statCards = [
    { label: 'Investor Members', value: stats?.investorMembers || 0, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Elite Members', value: stats?.eliteMembers || 0, icon: TrendingUp, color: 'text-gold' },
    { label: 'Courses', value: stats?.totalCourses || 0, icon: GraduationCap, color: 'text-purple-500' },
    { label: 'Properties', value: stats?.totalProperties || 0, icon: Building2, color: 'text-orange-500' },
    { label: 'Golden Visa Leads', value: stats?.goldenVisaSubmissions || 0, icon: Target, color: 'text-pink-500' },
    { label: 'Churn Rate', value: `${(revenueStats?.churnRate || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-red-500' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((stat, index) => (
              <Link 
                key={index} 
                to={stat.link}
                className="bg-card border border-border rounded-xl p-6 hover:border-gold/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="flex items-center gap-1">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </Link>
            ))}
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {recentActivity?.length ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'signup' ? 'bg-blue-500/10' :
                        activity.type === 'lead' ? 'bg-gold/10' :
                        'bg-purple-500/10'
                      }`}>
                        <activity.icon className={`h-4 w-4 ${
                          activity.type === 'signup' ? 'text-blue-500' :
                          activity.type === 'lead' ? 'text-gold' :
                          'text-purple-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/users" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <span className="text-sm">Manage Users</span>
                </Link>
                <Link to="/admin/courses" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <GraduationCap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <span className="text-sm">Manage Courses</span>
                </Link>
                <Link to="/admin/properties" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <span className="text-sm">Manage Properties</span>
                </Link>
                <Link to="/admin/revenue" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-gold" />
                  <span className="text-sm">View Revenue</span>
                </Link>
                <Link to="/admin/marketing" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <Target className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                  <span className="text-sm">Marketing & Ads</span>
                </Link>
                <Link to="/admin/analytics" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  <span className="text-sm">View Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
