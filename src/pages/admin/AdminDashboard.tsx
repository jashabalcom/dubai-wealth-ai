import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, Building2, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
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

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Investor Members', value: stats?.investorMembers || 0, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Elite Members', value: stats?.eliteMembers || 0, icon: TrendingUp, color: 'text-gold' },
    { label: 'Courses', value: stats?.totalCourses || 0, icon: GraduationCap, color: 'text-purple-500' },
    { label: 'Properties', value: stats?.totalProperties || 0, icon: Building2, color: 'text-orange-500' },
    { label: 'Golden Visa Leads', value: stats?.goldenVisaSubmissions || 0, icon: DollarSign, color: 'text-pink-500' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/users" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <span className="text-sm">Manage Users</span>
              </a>
              <a href="/admin/courses" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                <GraduationCap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <span className="text-sm">Manage Courses</span>
              </a>
              <a href="/admin/properties" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <span className="text-sm">Manage Properties</span>
              </a>
              <a href="/admin/analytics" className="p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <span className="text-sm">View Analytics</span>
              </a>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
