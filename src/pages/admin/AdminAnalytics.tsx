import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#CBB89E', '#22c55e', '#3b82f6', '#f97316', '#a855f7'];

export default function AdminAnalytics() {
  const { data: membershipData } = useQuery({
    queryKey: ['analytics-membership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_tier');
      
      if (error) throw error;
      
      const counts = { free: 0, investor: 0, elite: 0 };
      data.forEach((p) => {
        counts[p.membership_tier as keyof typeof counts]++;
      });
      
      return [
        { name: 'Free', value: counts.free },
        { name: 'Investor', value: counts.investor },
        { name: 'Elite', value: counts.elite },
      ];
    },
  });

  const { data: propertyData } = useQuery({
    queryKey: ['analytics-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('location_area, price_aed');
      
      if (error) throw error;
      
      const locationCounts: Record<string, number> = {};
      data.forEach((p) => {
        locationCounts[p.location_area] = (locationCounts[p.location_area] || 0) + 1;
      });
      
      return Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    },
  });

  const { data: courseData } = useQuery({
    queryKey: ['analytics-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('category, is_published');
      
      if (error) throw error;
      
      const categoryCounts: Record<string, { published: number; draft: number }> = {};
      data.forEach((c) => {
        if (!categoryCounts[c.category]) {
          categoryCounts[c.category] = { published: 0, draft: 0 };
        }
        if (c.is_published) {
          categoryCounts[c.category].published++;
        } else {
          categoryCounts[c.category].draft++;
        }
      });
      
      return Object.entries(categoryCounts).map(([name, counts]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        published: counts.published,
        draft: counts.draft,
      }));
    },
  });

  const { data: goldenVisaData } = useQuery({
    queryKey: ['analytics-golden-visa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golden_visa_submissions')
        .select('investment_budget, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      const budgetCounts: Record<string, number> = {};
      data.forEach((s) => {
        budgetCounts[s.investment_budget] = (budgetCounts[s.investment_budget] || 0) + 1;
      });
      
      return Object.entries(budgetCounts).map(([name, value]) => ({ name, value }));
    },
  });

  return (
    <AdminLayout title="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Membership Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={membershipData || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {(membershipData || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Properties by Location */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Properties by Location</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={propertyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#CBB89E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Courses by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Bar dataKey="published" name="Published" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="draft" name="Draft" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Golden Visa Leads by Budget */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Golden Visa Leads by Budget</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={goldenVisaData || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${value}`}
              >
                {(goldenVisaData || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {(goldenVisaData || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
