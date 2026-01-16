import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { performanceTracker, usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useWebVitalsStore } from '@/stores/webVitalsStore';
import { redisCache } from '@/lib/redis-cache';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

function MetricCard({ title, value, unit, icon, status, trend, description }: MetricCardProps) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 dark:bg-green-950',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
    error: 'text-red-600 bg-red-50 dark:bg-red-950',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Card className={statusColors[status]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {TrendIcon && <TrendIcon className="h-4 w-4 opacity-70" />}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs opacity-70 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function getResponseTimeStatus(ms: number): 'good' | 'warning' | 'error' {
  if (ms < 200) return 'good';
  if (ms < 500) return 'warning';
  return 'error';
}

function getErrorRateStatus(rate: number): 'good' | 'warning' | 'error' {
  if (rate < 0.01) return 'good';
  if (rate < 0.05) return 'warning';
  return 'error';
}

function getCacheHitStatus(rate: number): 'good' | 'warning' | 'error' {
  if (rate > 0.7) return 'good';
  if (rate > 0.4) return 'warning';
  return 'error';
}

export function PerformanceDashboard() {
  const { getMetrics } = usePerformanceMetrics();
  const webVitals = useWebVitalsStore((state) => state.vitals);
  const [metrics, setMetrics] = useState(getMetrics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshMetrics = useCallback(() => {
    setIsRefreshing(true);
    setMetrics(getMetrics());
    setTimeout(() => setIsRefreshing(false), 500);
  }, [getMetrics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshMetrics]);

  const cacheStats = redisCache.getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time application performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Requests"
              value={metrics.totalRequests}
              icon={<Activity className="h-4 w-4" />}
              status="good"
              description="Last 5 minutes"
            />
            <MetricCard
              title="Avg Response Time"
              value={metrics.avgResponseTime}
              unit="ms"
              icon={<Clock className="h-4 w-4" />}
              status={getResponseTimeStatus(metrics.avgResponseTime)}
              description="Target: <200ms"
            />
            <MetricCard
              title="P95 Response Time"
              value={metrics.p95ResponseTime}
              unit="ms"
              icon={<Zap className="h-4 w-4" />}
              status={getResponseTimeStatus(metrics.p95ResponseTime)}
              description="95th percentile"
            />
            <MetricCard
              title="Error Rate"
              value={(metrics.errorRate * 100).toFixed(2)}
              unit="%"
              icon={metrics.errorRate < 0.01 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              status={getErrorRateStatus(metrics.errorRate)}
              description="Target: <1%"
            />
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>System health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time Health</span>
                  <Badge variant={getResponseTimeStatus(metrics.avgResponseTime) === 'good' ? 'default' : 'destructive'}>
                    {getResponseTimeStatus(metrics.avgResponseTime).toUpperCase()}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (200 / Math.max(metrics.avgResponseTime, 1)) * 100)} 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <Badge variant={getCacheHitStatus(metrics.cacheHitRate) === 'good' ? 'default' : 'destructive'}>
                    {(metrics.cacheHitRate * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={metrics.cacheHitRate * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Error Rate</span>
                  <Badge variant={getErrorRateStatus(metrics.errorRate) === 'good' ? 'default' : 'destructive'}>
                    {(metrics.errorRate * 100).toFixed(2)}%
                  </Badge>
                </div>
                <Progress value={(1 - metrics.errorRate) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="LCP (Largest Contentful Paint)"
              value={webVitals.LCP?.value || 0}
              unit="ms"
              icon={<Activity className="h-4 w-4" />}
              status={webVitals.LCP?.rating === 'good' ? 'good' : webVitals.LCP?.rating === 'needs-improvement' ? 'warning' : 'error'}
              description="Target: <2500ms"
            />
            <MetricCard
              title="FCP (First Contentful Paint)"
              value={webVitals.FCP?.value || 0}
              unit="ms"
              icon={<Zap className="h-4 w-4" />}
              status={webVitals.FCP?.rating === 'good' ? 'good' : webVitals.FCP?.rating === 'needs-improvement' ? 'warning' : 'error'}
              description="Target: <1800ms"
            />
            <MetricCard
              title="CLS (Cumulative Layout Shift)"
              value={webVitals.CLS?.value || 0}
              icon={<Activity className="h-4 w-4" />}
              status={webVitals.CLS?.rating === 'good' ? 'good' : webVitals.CLS?.rating === 'needs-improvement' ? 'warning' : 'error'}
              description="Target: <0.1"
            />
            <MetricCard
              title="INP (Interaction to Next Paint)"
              value={webVitals.INP?.value || 0}
              unit="ms"
              icon={<Clock className="h-4 w-4" />}
              status={webVitals.INP?.rating === 'good' ? 'good' : webVitals.INP?.rating === 'needs-improvement' ? 'warning' : 'error'}
              description="Target: <200ms"
            />
            <MetricCard
              title="TTFB (Time to First Byte)"
              value={webVitals.TTFB?.value || 0}
              unit="ms"
              icon={<Database className="h-4 w-4" />}
              status={webVitals.TTFB?.rating === 'good' ? 'good' : webVitals.TTFB?.rating === 'needs-improvement' ? 'warning' : 'error'}
              description="Target: <800ms"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Web Vitals Explanation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>LCP</strong>: Measures loading performance. Good if &lt;2.5s.</p>
              <p><strong>FCP</strong>: First content appears. Good if &lt;1.8s.</p>
              <p><strong>CLS</strong>: Visual stability. Good if &lt;0.1.</p>
              <p><strong>INP</strong>: Responsiveness. Good if &lt;200ms.</p>
              <p><strong>TTFB</strong>: Server response time. Good if &lt;800ms.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Cache Hit Rate"
              value={(cacheStats.hitRate * 100).toFixed(1)}
              unit="%"
              icon={<Database className="h-4 w-4" />}
              status={getCacheHitStatus(cacheStats.hitRate)}
              description="Higher is better"
            />
            <MetricCard
              title="Local Cache Size"
              value={cacheStats.localSize}
              unit="items"
              icon={<Database className="h-4 w-4" />}
              status="good"
              description="In-memory cache"
            />
            <MetricCard
              title="Cache Hits"
              value={cacheStats.hits}
              icon={<CheckCircle className="h-4 w-4" />}
              status="good"
              description="Successful cache reads"
            />
            <MetricCard
              title="Cache Misses"
              value={cacheStats.misses}
              icon={<AlertTriangle className="h-4 w-4" />}
              status={cacheStats.misses > cacheStats.hits ? 'warning' : 'good'}
              description="Fallback to API"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cache Strategy</CardTitle>
              <CardDescription>Two-tier caching architecture</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Layer 1 - Local Cache</strong>: In-memory LRU cache for instant access (&lt;1ms).</p>
              <p><strong>Layer 2 - Redis</strong>: Distributed cache for shared state (5-20ms).</p>
              <p><strong>Layer 3 - CDN</strong>: Edge caching for static/semi-static data.</p>
              <p><strong>Layer 4 - Database</strong>: Source of truth with optimized indexes.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
