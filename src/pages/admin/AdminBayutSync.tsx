import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  Building2,
  Image,
  Clock,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface SyncLog {
  id: string;
  sync_type: string;
  area_name: string | null;
  started_at: string;
  completed_at: string | null;
  properties_found: number;
  properties_synced: number;
  photos_synced: number;
  api_calls_used: number;
  errors: string[];
  status: string;
}

interface DubaiArea {
  slug: string;
  id: string;
  name: string;
}

export default function AdminBayutSync() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('dubai-marina');
  const [selectedPurpose, setSelectedPurpose] = useState<'for-sale' | 'for-rent'>('for-sale');
  const [propertyLimit, setPropertyLimit] = useState<number>(10);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [areas, setAreas] = useState<DubaiArea[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSynced: 0,
    totalPhotos: 0,
    totalApiCalls: 0,
  });

  useEffect(() => {
    fetchSyncLogs();
    fetchAreas();
    fetchTotalStats();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'get_areas' },
      });
      if (data?.areas) {
        setAreas(data.areas);
      }
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const fetchSyncLogs = async () => {
    const { data, error } = await supabase
      .from('bayut_sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setSyncLogs(data as SyncLog[]);
    }
  };

  const fetchTotalStats = async () => {
    const { data, error } = await supabase
      .from('bayut_sync_logs')
      .select('properties_synced, photos_synced, api_calls_used')
      .eq('status', 'completed');

    if (!error && data) {
      const stats = data.reduce(
        (acc, log) => ({
          totalSynced: acc.totalSynced + (log.properties_synced || 0),
          totalPhotos: acc.totalPhotos + (log.photos_synced || 0),
          totalApiCalls: acc.totalApiCalls + (log.api_calls_used || 0),
        }),
        { totalSynced: 0, totalPhotos: 0, totalApiCalls: 0 }
      );
      setTotalStats(stats);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'test' },
      });

      if (error) throw error;

      if (data?.success) {
        setIsConnected(true);
        toast.success('API connection successful!');
      } else {
        setIsConnected(false);
        toast.error(data?.error || 'Connection failed');
      }
    } catch (error) {
      setIsConnected(false);
      toast.error('Failed to test connection');
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  const syncArea = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: {
          action: 'sync_area',
          area: selectedArea,
          purpose: selectedPurpose,
          limit: propertyLimit,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        fetchSyncLogs();
        fetchTotalStats();
      } else {
        toast.error(data?.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Failed to sync properties');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'completed_with_errors':
        return <Badge className="bg-amber-500/20 text-amber-400"><AlertCircle className="h-3 w-3 mr-1" />With Errors</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Bayut API Sync">
      <div className="space-y-6">
        {/* Connection Status & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isConnected === null ? (
                  <Wifi className="h-8 w-8 text-muted-foreground" />
                ) : isConnected ? (
                  <Wifi className="h-8 w-8 text-emerald-500" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">API Status</p>
                  <p className="font-semibold">
                    {isConnected === null ? 'Not Tested' : isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-sm text-muted-foreground">Properties Synced</p>
                  <p className="font-semibold">{totalStats.totalSynced}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Image className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Photos Re-hosted</p>
                  <p className="font-semibold">{totalStats.totalPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">API Calls Used</p>
                  <p className="font-semibold">{totalStats.totalApiCalls} / 500</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
            <CardDescription>
              Test your API connection and sync properties from Bayut. Free tier allows 500 API calls/month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={testConnection} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Sync Properties by Area</h4>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Area</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.slug} value={area.slug}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Purpose</label>
                  <Select value={selectedPurpose} onValueChange={(v) => setSelectedPurpose(v as 'for-sale' | 'for-rent')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="for-rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Limit</label>
                  <Select value={String(propertyLimit)} onValueChange={(v) => setPropertyLimit(Number(v))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={syncArea} 
                  disabled={isSyncing || !selectedArea}
                  className="bg-gold hover:bg-gold/90 text-primary-foreground"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Area
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Estimated API calls: 1 (list) + up to {propertyLimit} (details) = ~{propertyLimit + 1} calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>Recent sync operations and their results</CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sync operations yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>API Calls</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="capitalize">{log.sync_type}</TableCell>
                      <TableCell>{log.area_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(log.started_at), 'MMM d, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.properties_synced}/{log.properties_found}
                      </TableCell>
                      <TableCell>{log.photos_synced}</TableCell>
                      <TableCell>{log.api_calls_used}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Free tier:</strong> 500 API calls/month. Each property sync uses ~2 calls (1 list + 1 detail).</p>
            <p>• <strong>Photo re-hosting:</strong> Photos are downloaded from Bayut and stored in your own storage bucket.</p>
            <p>• <strong>Duplicate handling:</strong> Properties are matched by external_id - existing properties are updated, not duplicated.</p>
            <p>• <strong>Publishing:</strong> Synced properties start as unpublished for admin review. Enable them in the Properties admin.</p>
            <p>• <strong>Rate limiting:</strong> The sync respects API limits and processes properties sequentially.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
