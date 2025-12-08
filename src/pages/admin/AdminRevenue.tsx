import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, RefreshCcw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COLORS = ['#CBB89E', '#22c55e'];

interface MetricSnapshot {
  id: string;
  snapshot_date: string;
  mrr: number;
  arr: number;
  total_users: number;
  investor_count: number;
  elite_count: number;
  free_count: number;
  total_revenue: number;
  new_signups_today: number;
  churn_count: number;
}

export default function AdminRevenue() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading, refetch, isRefetching } = useAdminRevenue();

  // Fetch historical snapshots
  const { data: snapshots, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['admin-metrics-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_metrics_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: true })
        .limit(90); // Last 90 days
      
      if (error) throw error;
      return data as MetricSnapshot[];
    },
  });

  // Take snapshot mutation
  const takeSnapshot = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-snapshot-metrics');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-metrics-snapshots'] });
      toast.success('Metrics snapshot saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save snapshot: ' + error.message);
    },
  });

  // Calculate month-over-month growth
  const calculateGrowth = () => {
    if (!snapshots || snapshots.length < 2) return null;

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);

    const currentPeriod = snapshots.filter(s => parseISO(s.snapshot_date) >= thirtyDaysAgo);
    const previousPeriod = snapshots.filter(s => 
      parseISO(s.snapshot_date) >= sixtyDaysAgo && parseISO(s.snapshot_date) < thirtyDaysAgo
    );

    const currentMRR = currentPeriod.length > 0 ? currentPeriod[currentPeriod.length - 1].mrr : 0;
    const previousMRR = previousPeriod.length > 0 ? previousPeriod[previousPeriod.length - 1].mrr : 0;

    const currentUsers = currentPeriod.length > 0 ? currentPeriod[currentPeriod.length - 1].total_users : 0;
    const previousUsers = previousPeriod.length > 0 ? previousPeriod[previousPeriod.length - 1].total_users : 0;

    const mrrGrowth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;
    const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;

    return { mrrGrowth, userGrowth, currentMRR, previousMRR, currentUsers, previousUsers };
  };

  const growth = calculateGrowth();

  // Prepare chart data
  const mrrChartData = snapshots?.map(s => ({
    date: format(parseISO(s.snapshot_date), 'MMM d'),
    mrr: Number(s.mrr),
    arr: Number(s.arr),
  })) || [];

  const subscriberChartData = snapshots?.map(s => ({
    date: format(parseISO(s.snapshot_date), 'MMM d'),
    investor: s.investor_count,
    elite: s.elite_count,
    total: s.investor_count + s.elite_count,
  })) || [];

  const userGrowthData = snapshots?.map(s => ({
    date: format(parseISO(s.snapshot_date), 'MMM d'),
    users: s.total_users,
    signups: s.new_signups_today,
  })) || [];

  const tierBreakdown = [
    { name: 'Investor ($29/mo)', value: (stats?.investorCount || 0) * 29, count: stats?.investorCount || 0 },
    { name: 'Elite ($97/mo)', value: (stats?.eliteCount || 0) * 97, count: stats?.eliteCount || 0 },
  ];

  const statCards = [
    { 
      label: 'Monthly Recurring Revenue', 
      value: `$${(stats?.mrr || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-gold',
      subtext: 'Active subscriptions',
      growth: growth?.mrrGrowth,
    },
    { 
      label: 'Annual Recurring Revenue', 
      value: `$${(stats?.arr || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-emerald-500',
      subtext: 'MRR × 12'
    },
    { 
      label: 'Lifetime Revenue', 
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-blue-500',
      subtext: 'All time'
    },
    { 
      label: 'Last 30 Days Revenue', 
      value: `$${(stats?.recentRevenue || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-purple-500',
      subtext: 'Recent payments'
    },
    { 
      label: 'Avg Revenue Per User', 
      value: `$${(stats?.arpu || 0).toFixed(2)}`, 
      icon: Users, 
      color: 'text-orange-500',
      subtext: 'Per paying subscriber'
    },
    { 
      label: 'Customer Lifetime Value', 
      value: `$${(stats?.ltv || 0).toFixed(0)}`, 
      icon: TrendingUp, 
      color: 'text-pink-500',
      subtext: 'Estimated'
    },
    { 
      label: 'Churn Rate', 
      value: `${(stats?.churnRate || 0).toFixed(1)}%`, 
      icon: ArrowDownRight, 
      color: 'text-red-500',
      subtext: `${stats?.churnCount || 0} canceled (30d)`
    },
    { 
      label: 'Total Subscribers', 
      value: stats?.totalSubscribers || 0, 
      icon: Users, 
      color: 'text-cyan-500',
      subtext: `${stats?.investorCount || 0} Investor, ${stats?.eliteCount || 0} Elite`,
      growth: growth?.userGrowth,
    },
  ];

  return (
    <AdminLayout title="Revenue & Subscriptions">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {growth && (
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-1 ${growth.mrrGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {growth.mrrGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(growth.mrrGrowth).toFixed(1)}% MRR MoM</span>
              </div>
              <div className={`flex items-center gap-1 ${growth.userGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {growth.userGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(growth.userGrowth).toFixed(1)}% Users MoM</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => takeSnapshot.mutate()} 
            disabled={takeSnapshot.isPending}
          >
            <Camera className={`h-4 w-4 mr-2 ${takeSnapshot.isPending ? 'animate-pulse' : ''}`} />
            Take Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  {stat.growth !== undefined && (
                    <span className={`text-xs font-medium ${stat.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.growth >= 0 ? '↑' : '↓'} {Math.abs(stat.growth).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* Historical MRR Chart */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">MRR Over Time</h3>
            {snapshotsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : mrrChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mrrChartData}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CBB89E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#CBB89E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="#CBB89E" strokeWidth={2} fill="url(#mrrGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="h-12 w-12 mb-4 opacity-50" />
                <p>No historical data yet. Take your first snapshot above.</p>
              </div>
            )}
          </div>

          {/* Subscriber Growth Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
              {subscriberChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={subscriberChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="investor" name="Investor" stroke="#CBB89E" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="elite" name="Elite" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <p>Take snapshots to see growth trends</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">User Growth</h3>
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="users" name="Total Users" stroke="#3b82f6" strokeWidth={2} fill="url(#userGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <p>Take snapshots to see growth trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">MRR by Tier</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tierBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="value" name="MRR" fill="#CBB89E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Subscriber Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tierBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ count }) => `${count}`}
                  >
                    {tierBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {tierBreakdown.map((tier, index) => (
                  <div key={tier.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-muted-foreground">{tier.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
            {stats?.recentPayments && stats.recentPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.customer_email || 'Unknown'}</TableCell>
                      <TableCell className="text-emerald-500 font-medium">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(payment.created * 1000), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No recent payments found</p>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
