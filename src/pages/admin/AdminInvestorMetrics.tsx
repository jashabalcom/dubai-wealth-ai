import { useInvestorMetrics } from '@/hooks/useInvestorMetrics';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, 
  RefreshCcw, Download, Target, Briefcase, Zap, Clock, PieChart,
  BarChart3, Activity, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import { format } from 'date-fns';

const CHART_COLORS = ['#CBB89E', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminInvestorMetrics() {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const isReady = !!user && isAdmin && !adminLoading;
  const { data: metrics, isLoading, refetch, isRefetching } = useInvestorMetrics(isReady);

  // Export to JSON for data room
  const handleExport = () => {
    if (!metrics) return;
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investor-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare pie chart data
  const revenueBreakdownData = metrics ? [
    { name: 'Investor ($29/mo)', value: metrics.revenueByTier.investor.revenue },
    { name: 'Elite ($97/mo)', value: metrics.revenueByTier.elite.revenue },
    { name: 'Agent Basic', value: metrics.revenueByTier.agentBasic.revenue },
    { name: 'Agent Preferred', value: metrics.revenueByTier.agentPreferred.revenue },
    { name: 'Agent Premium', value: metrics.revenueByTier.agentPremium.revenue },
  ].filter(d => d.value > 0) : [];

  const b2bVsB2cData = metrics ? [
    { name: 'B2C (Consumer)', value: metrics.b2cRevenue },
    { name: 'B2B (Agents)', value: metrics.b2bRevenue },
  ].filter(d => d.value > 0) : [];

  // Cohort analysis data
  const cohortChartData = metrics ? Object.entries(metrics.cohorts)
    .slice(-12)
    .map(([month, data]) => ({
      month,
      signups: data.signups,
      conversions: data.conversions,
      conversionRate: data.signups > 0 ? ((data.conversions / data.signups) * 100).toFixed(1) : 0,
    })) : [];

  // Unit Economics cards
  const unitEconomicsCards = [
    {
      title: 'Customer Acquisition Cost',
      value: `$${(metrics?.cac || 0).toFixed(0)}`,
      subtitle: 'Cost to acquire one customer',
      icon: Wallet,
      color: 'text-blue-500',
      benchmark: '$50-150 typical SaaS',
    },
    {
      title: 'Lifetime Value',
      value: `$${(metrics?.ltv || 0).toFixed(0)}`,
      subtitle: 'Expected revenue per customer',
      icon: TrendingUp,
      color: 'text-emerald-500',
      benchmark: 'Target 3-5x CAC',
    },
    {
      title: 'LTV:CAC Ratio',
      value: `${(metrics?.ltvCacRatio || 0).toFixed(1)}x`,
      subtitle: metrics?.ltvCacRatio && metrics.ltvCacRatio >= 3 ? 'Healthy ratio!' : 'Target 3x+',
      icon: Target,
      color: metrics?.ltvCacRatio && metrics.ltvCacRatio >= 3 ? 'text-emerald-500' : 'text-amber-500',
      benchmark: '3:1 is industry benchmark',
    },
    {
      title: 'Payback Period',
      value: `${(metrics?.paybackMonths || 0).toFixed(1)} mo`,
      subtitle: 'Months to recover CAC',
      icon: Clock,
      color: metrics?.paybackMonths && metrics.paybackMonths <= 12 ? 'text-emerald-500' : 'text-amber-500',
      benchmark: '<12 months ideal',
    },
  ];

  // Key metrics for investors
  const keyMetricsCards = [
    { 
      label: 'Monthly Recurring Revenue', 
      value: `$${(metrics?.mrr || 0).toLocaleString()}`,
      icon: DollarSign, 
      color: 'text-gold',
      growth: metrics?.mrrGrowthMoM,
    },
    { 
      label: 'Annual Run Rate', 
      value: `$${(metrics?.arr || 0).toLocaleString()}`,
      icon: TrendingUp, 
      color: 'text-emerald-500',
    },
    { 
      label: 'Total Lifetime Revenue', 
      value: `$${(metrics?.totalRevenue || 0).toLocaleString()}`,
      icon: Briefcase, 
      color: 'text-blue-500',
    },
    { 
      label: 'Paying Subscribers', 
      value: metrics?.totalSubscribers || 0,
      icon: Users, 
      color: 'text-purple-500',
      growth: metrics?.userGrowthMoM,
    },
    { 
      label: 'Retention Rate', 
      value: `${(metrics?.retentionRate || 0).toFixed(1)}%`,
      icon: Activity, 
      color: metrics?.retentionRate && metrics.retentionRate >= 90 ? 'text-emerald-500' : 'text-amber-500',
    },
    { 
      label: 'Monthly Churn', 
      value: `${(metrics?.churnRate || 0).toFixed(1)}%`,
      icon: ArrowDownRight, 
      color: metrics?.churnRate && metrics.churnRate <= 5 ? 'text-emerald-500' : 'text-red-500',
    },
  ];

  const productMetrics = [
    { label: 'Total Users', value: metrics?.totalUsers?.toLocaleString() || '0', icon: Users },
    { label: 'Weekly Active Users', value: metrics?.wau?.toLocaleString() || '0', icon: Activity },
    { label: 'Monthly Active Users', value: metrics?.mau?.toLocaleString() || '0', icon: Zap },
    { label: 'Properties Listed', value: metrics?.totalProperties?.toLocaleString() || '0', icon: Briefcase },
    { label: 'Neighborhoods', value: metrics?.totalNeighborhoods?.toLocaleString() || '0', icon: BarChart3 },
    { label: 'Lessons Completed', value: metrics?.lessonsCompleted?.toLocaleString() || '0', icon: Target },
    { label: 'Community Posts', value: metrics?.totalPosts?.toLocaleString() || '0', icon: PieChart },
    { label: 'AI Queries', value: metrics?.aiQueriesCount?.toLocaleString() || '0', icon: Zap },
  ];

  return (
    <AdminLayout title="Investor Metrics Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-gold border-gold">
            Series A Ready
          </Badge>
          {metrics?.generatedAt && (
            <span className="text-xs text-muted-foreground">
              Updated {format(new Date(metrics.generatedAt), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!metrics}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyMetricsCards.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      {stat.growth !== undefined && (
                        <span className={`text-xs font-medium ${stat.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.growth >= 0 ? '↑' : '↓'} {Math.abs(stat.growth).toFixed(1)}% MoM
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Tier</CardTitle>
                  <CardDescription>MRR breakdown by subscription tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueBreakdownData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>B2C vs B2B Revenue</CardTitle>
                  <CardDescription>Consumer vs Agent portal revenue split</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={b2bVsB2cData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {b2bVsB2cData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gold/10 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">B2C Revenue</p>
                      <p className="text-lg font-bold text-gold">${(metrics?.b2cRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">B2B Revenue</p>
                      <p className="text-lg font-bold text-blue-500">${(metrics?.b2bRevenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UNIT ECONOMICS TAB */}
          <TabsContent value="unit-economics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {unitEconomicsCards.map((card, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2 italic">{card.benchmark}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Unit Economics Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Economics Summary</CardTitle>
                <CardDescription>Key SaaS health indicators for investors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ARPU</span>
                        <span className="font-medium">${(metrics?.arpu || 0).toFixed(2)}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">LTV</span>
                        <span className="font-medium">${(metrics?.ltv || 0).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Net Revenue/Mo</span>
                        <span className="font-medium text-emerald-500">${(metrics?.netMRR || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Efficiency</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">CAC</span>
                        <span className="font-medium">${(metrics?.cac || 0).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">LTV:CAC</span>
                        <span className={`font-medium ${(metrics?.ltvCacRatio || 0) >= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {(metrics?.ltvCacRatio || 0).toFixed(1)}:1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payback</span>
                        <span className="font-medium">{(metrics?.paybackMonths || 0).toFixed(1)} months</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Retention</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Churn</span>
                        <span className={`font-medium ${(metrics?.churnRate || 0) <= 5 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(metrics?.churnRate || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Annual Churn</span>
                        <span className="font-medium">{((metrics?.churnRate || 0) * 12).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Retention</span>
                        <span className="font-medium text-emerald-500">{(metrics?.retentionRate || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COHORTS TAB */}
          <TabsContent value="cohorts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Cohort Analysis</CardTitle>
                <CardDescription>Monthly signups and conversion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={cohortChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="signups" fill="#CBB89E" name="Signups" />
                    <Bar yAxisId="left" dataKey="conversions" fill="#22c55e" name="Conversions" />
                    <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#3b82f6" strokeWidth={2} name="Conv. Rate %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCT TAB */}
          <TabsContent value="product" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className="text-2xl font-bold">{metric.value}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Engagement</CardTitle>
                <CardDescription>Active user metrics and feature usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gold/10 rounded-xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">DAU/MAU Ratio</p>
                    <p className="text-3xl font-bold text-gold">
                      {metrics?.mau && metrics.mau > 0 
                        ? ((metrics.wau || 0) / metrics.mau * 100 / 7).toFixed(0) 
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Stickiness indicator</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Lessons/User</p>
                    <p className="text-3xl font-bold text-emerald-500">
                      {metrics?.totalUsers && metrics.totalUsers > 0
                        ? ((metrics.lessonsCompleted || 0) / metrics.totalUsers).toFixed(1)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Academy engagement</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">AI Queries/User</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {metrics?.totalUsers && metrics.totalUsers > 0
                        ? ((metrics.aiQueriesCount || 0) / metrics.totalUsers).toFixed(1)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">AI feature adoption</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </AdminLayout>
  );
}
