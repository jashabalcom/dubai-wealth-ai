import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Calendar, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Settings2,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useSyncSchedule } from '@/hooks/useSyncSchedule';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function SyncScheduleTab() {
  const {
    schedule,
    isLoading,
    isUpdating,
    isRunningNow,
    toggleEnabled,
    updateConfig,
    updateScheduleTime,
    runNow,
  } = useSyncSchedule();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-bayut-connection');
      
      if (error) {
        setConnectionStatus({
          tested: true,
          success: false,
          message: error.message || 'Connection test failed',
        });
        toast.error('API connection test failed');
        return;
      }

      if (data?.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: data.message || 'Connection successful',
          details: data.diagnosis,
        });
        toast.success('API connection verified!');
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: data?.diagnosis?.recommendation || data?.error || 'Connection failed',
          details: data?.diagnosis,
        });
        toast.error(data?.diagnosis?.issue || 'API connection failed');
      }
    } catch (err) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      toast.error('Connection test error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No schedule configuration found.
        </CardContent>
      </Card>
    );
  }

  const config = schedule.config || {};
  const currentHour = parseInt(schedule.cron_expression.split(' ')[1]) || 23;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Never Run</Badge>;
    }
  };

  // Convert UTC hour to Dubai time (UTC+4)
  const getDubaiHour = (utcHour: number) => (utcHour + 4) % 24;
  const getUTCFromDubai = (dubaiHour: number) => (dubaiHour - 4 + 24) % 24;

  return (
    <div className="space-y-6">
      {/* Schedule Control Card */}
      <Card className="border-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              Daily Auto-Sync Schedule
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="schedule-enabled" className="text-sm font-normal">
                {schedule.is_enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="schedule-enabled"
                checked={schedule.is_enabled}
                onCheckedChange={toggleEnabled}
                disabled={isUpdating}
              />
            </div>
          </CardTitle>
          <CardDescription>
            Automatically sync properties from Bayut every day at a scheduled time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm text-muted-foreground">Last Run</p>
              <p className="font-semibold">
                {schedule.last_run_at 
                  ? formatDistanceToNow(new Date(schedule.last_run_at), { addSuffix: true })
                  : 'Never'
                }
              </p>
              {schedule.last_run_at && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(schedule.last_run_at), 'PPpp')}
                </p>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm text-muted-foreground">Last Status</p>
              {getStatusBadge(schedule.last_run_status)}
              {schedule.last_run_properties_synced > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {schedule.last_run_properties_synced.toLocaleString()} properties
                  {schedule.last_run_duration_seconds && ` in ${Math.round(schedule.last_run_duration_seconds / 60)}m`}
                </p>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm text-muted-foreground">Next Run</p>
              <p className="font-semibold">
                {schedule.is_enabled && schedule.next_run_at
                  ? formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true })
                  : 'Not scheduled'
                }
              </p>
              {schedule.is_enabled && schedule.next_run_at && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(schedule.next_run_at), 'PPpp')}
                </p>
              )}
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus?.tested && (
            <div className={`p-4 rounded-lg border ${
              connectionStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {connectionStatus.success ? (
                  <Wifi className="h-5 w-5 text-emerald-400 mt-0.5" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className={`text-sm font-medium ${
                    connectionStatus.success ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {connectionStatus.success ? 'API Connected' : 'API Connection Failed'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.message}
                  </p>
                  {connectionStatus.details && !connectionStatus.success && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Key prefix: {connectionStatus.details.keyPrefix} • 
                      Status: {connectionStatus.details.httpStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              variant="outline"
              className="flex-1"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Test API Connection
                </>
              )}
            </Button>
            <Button
              onClick={runNow}
              disabled={isRunningNow}
              className="flex-1"
              variant={schedule.is_enabled ? "default" : "secondary"}
            >
              {isRunningNow ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run Sync Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Sync Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule Time */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sync Time (Dubai Time)
            </Label>
            <Select
              value={String(getDubaiHour(currentHour))}
              onValueChange={(v) => updateScheduleTime(getUTCFromDubai(parseInt(v)))}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i.toString().padStart(2, '0')}:00 {i < 12 ? 'AM' : 'PM'}
                    {i === 3 && ' (Recommended - Low Traffic)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Currently set to {getDubaiHour(currentHour).toString().padStart(2, '0')}:00 Dubai time ({currentHour.toString().padStart(2, '0')}:00 UTC)
            </p>
          </div>

          {/* Pages Per Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pages Per Area</Label>
              <span className="text-sm font-medium">{config.pages_per_area || 5}</span>
            </div>
            <Slider
              value={[config.pages_per_area || 5]}
              min={1}
              max={20}
              step={1}
              onValueCommit={(v) => updateConfig({ pages_per_area: v[0] })}
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground">
              ~{((config.pages_per_area || 5) * 50 * 25).toLocaleString()} properties estimated (25 areas × {config.pages_per_area || 5} pages × 50 listings)
            </p>
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Include Rentals</Label>
                <p className="text-xs text-muted-foreground">Sync rental properties too</p>
              </div>
              <Switch
                checked={config.include_rentals !== false}
                onCheckedChange={(v) => updateConfig({ include_rentals: v })}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Lite Mode
                </Label>
                <p className="text-xs text-muted-foreground">Fast sync, skip photo re-hosting</p>
              </div>
              <Switch
                checked={config.lite_mode === true}
                onCheckedChange={(v) => updateConfig({ lite_mode: v })}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Skip Recent</Label>
                <p className="text-xs text-muted-foreground">Skip properties synced &lt;24h ago</p>
              </div>
              <Switch
                checked={config.skip_recently_synced === true}
                onCheckedChange={(v) => updateConfig({ skip_recently_synced: v })}
                disabled={isUpdating}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Scheduled Sync</p>
              <p className="text-sm text-muted-foreground">
                The daily sync runs automatically using pg_cron. It syncs all 25 top Dubai areas with your configured settings.
                Manual properties (agent listings) are never affected by sync operations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
