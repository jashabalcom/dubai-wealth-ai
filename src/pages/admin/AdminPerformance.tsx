import { useState, useEffect } from 'react';
import { Activity, Zap, HardDrive, RefreshCw, CheckCircle, AlertTriangle, XCircle, Gauge } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { runPerformanceAudit, getMemoryUsage, checkDOMHealth, type AuditResult } from '@/lib/performanceAudit';

export default function AdminPerformance() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState<{ usedJSHeapSize: number; totalJSHeapSize: number } | null>(null);
  const [domIssues, setDomIssues] = useState<{ issue: string; severity: 'warn' | 'error' }[]>([]);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const result = await runPerformanceAudit();
      setAuditResult(result);
      setMemoryUsage(getMemoryUsage());
      setDomIssues(checkDOMHealth());
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'needs-improvement': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'poor': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <AdminLayout title="Performance Audit">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Real-time performance metrics and optimization recommendations
            </p>
          </div>
          <Button onClick={runAudit} disabled={isRunning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Audit'}
          </Button>
        </div>

        {/* Overall Score */}
        {auditResult && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={`text-6xl font-bold ${getScoreColor(auditResult.score)}`}>
                  {auditResult.score}
                </div>
                <div className="flex-1">
                  <Progress value={auditResult.score} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {auditResult.score >= 90 ? 'Excellent! Your app is well optimized.' :
                     auditResult.score >= 70 ? 'Good, but there\'s room for improvement.' :
                     auditResult.score >= 50 ? 'Needs attention. Review recommendations below.' :
                     'Poor performance. Immediate optimization needed.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Grid */}
        {auditResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditResult.metrics.map((metric, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.name}</span>
                    {getRatingIcon(metric.rating)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <Badge variant="outline" className={`mt-2 ${getRatingColor(metric.rating)}`}>
                    {metric.rating.replace('-', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Memory Usage */}
        {memoryUsage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Memory Usage
              </CardTitle>
              <CardDescription>JavaScript heap memory utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-2xl font-bold">{memoryUsage.usedJSHeapSize} MB</p>
                </div>
                <div className="text-2xl text-muted-foreground">/</div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{memoryUsage.totalJSHeapSize} MB</p>
                </div>
                <div className="flex-1">
                  <Progress 
                    value={(memoryUsage.usedJSHeapSize / memoryUsage.totalJSHeapSize) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DOM Health */}
        {domIssues.length > 0 && (
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                DOM Health Issues
              </CardTitle>
              <CardDescription>Potential performance problems in the DOM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {issue.severity === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-sm">{issue.issue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {auditResult && auditResult.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gold" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>Actions to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {auditResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-gold">{idx + 1}</span>
                    </div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* No Issues */}
        {auditResult && auditResult.recommendations.length === 0 && domIssues.length === 0 && (
          <Card className="border-green-500/30">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No performance issues detected. Your app is running smoothly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
