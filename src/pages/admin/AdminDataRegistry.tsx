import { useState } from 'react';
import { useDataRegistry, useAreaMarketData, useExpiringData, useStaleData, useUpdateDataEntry } from '@/hooks/useDubaiDataRegistry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle2, Clock, Database, Edit, ExternalLink, RefreshCw, Shield } from 'lucide-react';
import { DataCategory, DataConfidenceLevel, DATA_CATEGORY_INFO, CONFIDENCE_LEVEL_INFO, formatVerificationDate, isDataStale, isDataExpiringSoon } from '@/lib/dataRegistry';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminDataRegistry() {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editMethod, setEditMethod] = useState('website_check');

  const { data: registryData, isLoading } = useDataRegistry(selectedCategory === 'all' ? undefined : selectedCategory);
  const { data: areaData } = useAreaMarketData();
  const { data: expiringData } = useExpiringData(14);
  const { data: staleData } = useStaleData();
  const updateEntry = useUpdateDataEntry();

  const handleSaveEdit = async (entryId: string, currentValue: Record<string, unknown>) => {
    try {
      const newValue = JSON.parse(editValue);
      await updateEntry.mutateAsync({
        id: entryId,
        updates: {
          value_json: newValue,
          verified_at: new Date().toISOString(),
          confidence_level: 'verified',
        },
        verificationMethod: editMethod,
        notes: editNotes,
      });
      toast.success('Data updated successfully');
      setEditingEntry(null);
    } catch (error) {
      toast.error('Failed to update data');
    }
  };

  const categories = Object.entries(DATA_CATEGORY_INFO) as [DataCategory, typeof DATA_CATEGORY_INFO[DataCategory]][];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dubai Data Registry</h1>
          <p className="text-muted-foreground">Manage verified Dubai real estate data and fee configurations</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sync All Sources
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(staleData && staleData.length > 0 && "border-red-500/50")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Stale Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staleData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Entries need immediate verification</p>
          </CardContent>
        </Card>

        <Card className={cn(expiringData && expiringData.length > 0 && "border-amber-500/50")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Entries expiring within 14 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registryData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active data entries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registry">Data Registry</TabsTrigger>
          <TabsTrigger value="areas">Area Market Data</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({(staleData?.length || 0) + (expiringData?.length || 0)})</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as DataCategory | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(([key, info]) => (
                  <SelectItem key={key} value={key}>{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading data...</div>
            ) : registryData?.map((entry) => {
              const isStaleEntry = isDataStale(entry.expires_at);
              const isExpiring = isDataExpiringSoon(entry.expires_at, 14);
              const confidenceInfo = CONFIDENCE_LEVEL_INFO[entry.confidence_level];
              
              return (
                <Card key={entry.id} className={cn(
                  isStaleEntry && "border-red-500/50 bg-red-500/5",
                  !isStaleEntry && isExpiring && "border-amber-500/50 bg-amber-500/5"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {entry.display_name}
                          {entry.is_critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                        </CardTitle>
                        <CardDescription>{entry.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          `bg-${confidenceInfo.color}-500/10 text-${confidenceInfo.color}-500`
                        )}>
                          {entry.confidence_level === 'official' && <Shield className="h-3 w-3 mr-1" />}
                          {entry.confidence_level === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {confidenceInfo.label}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingEntry(entry.id);
                            setEditValue(JSON.stringify(entry.value_json, null, 2));
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <code className="bg-muted px-2 py-0.5 rounded">
                          {JSON.stringify((entry.value_json as Record<string, unknown>).value)} {entry.unit}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="flex items-center gap-1">
                          {entry.source_name}
                          {entry.source_url && (
                            <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified:</span>
                        <span className={cn(isStaleEntry && "text-red-500")}>
                          {formatVerificationDate(entry.verified_at)}
                          {isStaleEntry && " (STALE)"}
                          {!isStaleEntry && isExpiring && " (Expiring soon)"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="areas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areaData?.map((area) => (
              <Card key={area.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{area.area_name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Price/sqft:</span>
                    <span>AED {area.avg_price_sqft?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Yield:</span>
                    <span>{area.avg_yield}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Charge:</span>
                    <span>AED {area.service_charge_sqft}/sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">District Cooling:</span>
                    <span>{area.has_district_cooling ? `AED ${area.chiller_monthly}/mo` : 'No'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {staleData && staleData.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-500 mb-2">Stale Data (Expired)</h3>
                <div className="space-y-2">
                  {staleData.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                      <div>
                        <span className="font-medium">{entry.display_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Expired: {formatVerificationDate(entry.expires_at)}
                        </span>
                      </div>
                      <Button size="sm" onClick={() => {
                        setEditingEntry(entry.id);
                        setEditValue(JSON.stringify(entry.value_json, null, 2));
                      }}>
                        Verify Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringData && expiringData.filter(e => !isDataStale(e.expires_at)).length > 0 && (
              <div>
                <h3 className="font-semibold text-amber-500 mb-2">Expiring Soon</h3>
                <div className="space-y-2">
                  {expiringData.filter(e => !isDataStale(e.expires_at)).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                      <div>
                        <span className="font-medium">{entry.display_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Expires: {formatVerificationDate(entry.expires_at)}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingEntry(entry.id);
                        setEditValue(JSON.stringify(entry.value_json, null, 2));
                      }}>
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!staleData || staleData.length === 0) && (!expiringData || expiringData.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                <p>All data is up to date!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Data Entry</DialogTitle>
            <DialogDescription>Update the value and verify the data source.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Value (JSON)</Label>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono text-sm h-32"
              />
            </div>
            <div>
              <Label>Verification Method</Label>
              <Select value={editMethod} onValueChange={setEditMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="official_document">Official Document</SelectItem>
                  <SelectItem value="website_check">Website Check</SelectItem>
                  <SelectItem value="api_sync">API Sync</SelectItem>
                  <SelectItem value="manual_entry">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Document your verification..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
            <Button onClick={() => editingEntry && handleSaveEdit(editingEntry, {})}>
              Save & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
