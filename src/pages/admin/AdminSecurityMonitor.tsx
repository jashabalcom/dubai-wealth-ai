import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfDay } from 'date-fns';
import { Shield, AlertTriangle, Ban, Activity, RefreshCw, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

type SecurityEvent = {
  id: string;
  event_type: string;
  severity: string;
  user_id: string | null;
  ip_address: string | null;
  endpoint: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export default function AdminSecurityMonitor() {
  const [timeRange, setTimeRange] = useState('24h');
  const [eventFilter, setEventFilter] = useState('all');

  const getStartDate = () => {
    switch (timeRange) {
      case '1h': return subDays(new Date(), 1/24);
      case '24h': return subDays(new Date(), 1);
      case '7d': return subDays(new Date(), 7);
      case '30d': return subDays(new Date(), 30);
      default: return subDays(new Date(), 1);
    }
  };

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['security-events', timeRange, eventFilter],
    queryFn: async () => {
      let query = supabase
        .from('security_events')
        .select('*')
        .gte('created_at', getStartDate().toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventFilter !== 'all') {
        query = query.eq('event_type', eventFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: rateLimitStats } = useQuery({
    queryKey: ['rate-limit-stats', timeRange],
    queryFn: async () => {
      const startDate = getStartDate();
      const { data, error } = await supabase
        .from('rate_limits')
        .select('key, count, window_start')
        .gte('window_start', startDate.toISOString())
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const { data: authStats } = useQuery({
    queryKey: ['auth-failure-stats', timeRange],
    queryFn: async () => {
      const { count } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'failed_auth')
        .gte('created_at', getStartDate().toISOString());
      
      return { failedAttempts: count || 0 };
    },
  });

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      warn: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      error: 'bg-red-500/10 text-red-500 border-red-500/20',
      critical: 'bg-red-600/20 text-red-400 border-red-500/40',
    };
    return <Badge variant="outline" className={colors[severity] || colors.info}>{severity}</Badge>;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'rate_limit_hit': return <Ban className="w-4 h-4 text-amber-500" />;
      case 'failed_auth': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'suspicious_activity': return <Shield className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const eventCounts = events?.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const criticalCount = events?.filter(e => e.severity === 'critical' || e.severity === 'error').length || 0;

  return (
    <AdminLayout title="Security Monitor">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="rate_limit_hit">Rate Limits</SelectItem>
                <SelectItem value="failed_auth">Failed Auth</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious</SelectItem>
                <SelectItem value="reauth_success">Re-auth Success</SelectItem>
                <SelectItem value="reauth_failure">Re-auth Failure</SelectItem>
                <SelectItem value="sensitive_action">Sensitive Actions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Events</CardDescription>
              <CardTitle className="text-2xl">{events?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="w-4 h-4 mr-1" />
                In selected period
              </div>
            </CardContent>
          </Card>

          <Card className={criticalCount > 0 ? 'border-red-500/50' : ''}>
            <CardHeader className="pb-2">
              <CardDescription>Critical/Error Events</CardDescription>
              <CardTitle className={`text-2xl ${criticalCount > 0 ? 'text-red-500' : ''}`}>
                {criticalCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                {criticalCount > 0 ? (
                  <><TrendingUp className="w-4 h-4 mr-1 text-red-500" /> Needs attention</>
                ) : (
                  <><TrendingDown className="w-4 h-4 mr-1 text-green-500" /> All clear</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rate Limit Hits</CardDescription>
              <CardTitle className="text-2xl">{eventCounts['rate_limit_hit'] || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Ban className="w-4 h-4 mr-1" />
                Blocked requests
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Auth Attempts</CardDescription>
              <CardTitle className="text-2xl">{authStats?.failedAttempts || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Login failures
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Rate-Limited Endpoints */}
        {rateLimitStats && rateLimitStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Top Rate-Limited Keys
              </CardTitle>
              <CardDescription>Most frequently rate-limited endpoints/users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimitStats.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="font-mono text-sm truncate max-w-[60%]">{item.key}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.window_start), 'MMM d, HH:mm')}
                      </span>
                      <Badge variant="secondary">{item.count} hits</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Event Log
            </CardTitle>
            <CardDescription>Recent security events across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : events?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No security events in the selected period</p>
                <p className="text-sm">This is a good sign!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events?.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-background rounded-lg">
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.event_type.replace(/_/g, ' ')}</span>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {event.ip_address && <p>IP: {event.ip_address}</p>}
                        {event.endpoint && <p>Endpoint: {event.endpoint}</p>}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <p className="truncate">
                            Details: {JSON.stringify(event.details)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
