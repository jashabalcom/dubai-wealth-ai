import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#CBB89E', '#22c55e'];

export default function AdminRevenue() {
  const { data: stats, isLoading, refetch, isRefetching } = useAdminRevenue();

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
      subtext: 'Active subscriptions'
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
      subtext: `${stats?.investorCount || 0} Investor, ${stats?.eliteCount || 0} Elite`
    },
  ];

  return (
    <AdminLayout title="Revenue & Subscriptions">
      <div className="flex justify-end mb-6">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
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
                    label={({ name, count }) => `${count}`}
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
