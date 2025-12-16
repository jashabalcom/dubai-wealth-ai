import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Zap,
  Search,
  MapPin,
  X,
  TrendingUp,
  Users
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

interface Location {
  id: number;
  name: string;
  level: string;
  path?: string;
}

interface Transaction {
  id: string;
  date: string;
  price: number;
  area: number;
  rooms: number;
  location: string;
  property_type: string;
  floor?: number;
}

interface Developer {
  id: number;
  name: string;
  logo?: string;
  projects_count?: number;
  properties_count?: number;
}

interface BayutAgent {
  id: string;
  bayut_id: string;
  name: string;
  brn: string | null;
  phone: string | null;
  whatsapp: string | null;
  photo_url: string | null;
  agency_name: string | null;
  is_trubroker: boolean;
  property_count: number;
  last_synced_at: string;
}

interface BayutAgency {
  id: string;
  bayut_id: string;
  name: string;
  logo_url: string | null;
  orn: string | null;
  phone: string | null;
  agent_count: number;
  property_count: number;
  product_tier: string | null;
  last_synced_at: string;
}

export default function AdminBayutSync() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSynced: 0,
    totalPhotos: 0,
    totalApiCalls: 0,
  });

  // Location search
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);

  // Property filters
  const [purpose, setPurpose] = useState<'for-sale' | 'for-rent'>('for-sale');
  const [category, setCategory] = useState<string>('all');
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [areaMin, setAreaMin] = useState<string>('');
  const [areaMax, setAreaMax] = useState<string>('');
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  const [saleType, setSaleType] = useState<string>('all');
  const [hasVideo, setHasVideo] = useState(false);
  const [hasPanorama, setHasPanorama] = useState(false);
  const [hasFloorplan, setHasFloorplan] = useState(false);
  const [sortIndex, setSortIndex] = useState<string>('latest');
  const [propertyLimit, setPropertyLimit] = useState<number>(20);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [txStartDate, setTxStartDate] = useState<string>('');
  const [txEndDate, setTxEndDate] = useState<string>('');

  // Developers
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [developerQuery, setDeveloperQuery] = useState('');

  // Agents (Admin Intelligence)
  const [agents, setAgents] = useState<BayutAgent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentQuery, setAgentQuery] = useState('');

  // Agencies (Admin Intelligence)
  const [agencies, setAgencies] = useState<BayutAgency[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);
  const [agencyQuery, setAgencyQuery] = useState('');

  useEffect(() => {
    fetchSyncLogs();
    fetchTotalStats();
    fetchAgents();
    fetchAgencies();
  }, []);

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
        toast.success(`API connected! (${data.apiVersion})`);
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

  const searchLocations = async () => {
    if (!locationQuery.trim()) return;
    
    setIsSearchingLocations(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'search_locations', query: locationQuery },
      });

      if (error) throw error;

      if (data?.locations) {
        setLocationResults(data.locations);
      }
    } catch (error) {
      toast.error('Failed to search locations');
      console.error(error);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  const addLocation = (location: Location) => {
    if (!selectedLocations.find(l => l.id === location.id)) {
      setSelectedLocations([...selectedLocations, location]);
    }
    setLocationResults([]);
    setLocationQuery('');
  };

  const removeLocation = (locationId: number) => {
    setSelectedLocations(selectedLocations.filter(l => l.id !== locationId));
  };

  const syncProperties = async () => {
    if (selectedLocations.length === 0) {
      toast.error('Please select at least one location');
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: {
          action: 'sync_properties',
          locations_ids: selectedLocations.map(l => l.id),
          purpose,
          category: category !== 'all' ? category : undefined,
          rooms: selectedRooms.length > 0 ? selectedRooms : undefined,
          price_min: priceMin ? parseInt(priceMin) : undefined,
          price_max: priceMax ? parseInt(priceMax) : undefined,
          area_min: areaMin ? parseInt(areaMin) : undefined,
          area_max: areaMax ? parseInt(areaMax) : undefined,
          completion_status: completionStatus !== 'all' ? completionStatus : undefined,
          sale_type: saleType !== 'all' ? saleType : undefined,
          has_video: hasVideo || undefined,
          has_panorama: hasPanorama || undefined,
          has_floorplan: hasFloorplan || undefined,
          index: sortIndex,
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

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: {
          action: 'sync_transactions',
          locations_ids: selectedLocations.map(l => l.id),
          purpose,
          category: category || undefined,
          rooms: selectedRooms.length > 0 ? selectedRooms : undefined,
          start_date: txStartDate || undefined,
          end_date: txEndDate || undefined,
          limit: 50,
        },
      });

      if (error) throw error;

      if (data?.transactions) {
        setTransactions(data.transactions);
        toast.success(`Found ${data.transactions.length} transactions`);
      }
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error(error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const searchDevelopers = async () => {
    setIsLoadingDevelopers(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: {
          action: 'search_developers',
          query: developerQuery || undefined,
          limit: 20,
        },
      });

      if (error) throw error;

      if (data?.developers) {
        setDevelopers(data.developers);
        toast.success(`Found ${data.developers.length} developers`);
      }
    } catch (error) {
      toast.error('Failed to search developers');
      console.error(error);
    } finally {
      setIsLoadingDevelopers(false);
    }
  };

  // Fetch agents from bayut_agents table
  const fetchAgents = async (query?: string) => {
    setIsLoadingAgents(true);
    try {
      let q = (supabase as any)
        .from('bayut_agents')
        .select('*')
        .order('last_synced_at', { ascending: false })
        .limit(50);
      
      if (query) {
        q = q.ilike('name', `%${query}%`);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      setAgents((data || []) as BayutAgent[]);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Fetch agencies from bayut_agencies table
  const fetchAgencies = async (query?: string) => {
    setIsLoadingAgencies(true);
    try {
      let q = (supabase as any)
        .from('bayut_agencies')
        .select('*')
        .order('last_synced_at', { ascending: false })
        .limit(50);
      
      if (query) {
        q = q.ilike('name', `%${query}%`);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      setAgencies((data || []) as BayutAgency[]);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setIsLoadingAgencies(false);
    }
  };

  // Search agents via API
  const searchAgentsAPI = async () => {
    if (!agentQuery.trim()) {
      fetchAgents();
      return;
    }
    
    setIsLoadingAgents(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'search_agents', query: agentQuery },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Found ${data.agents?.length || 0} agents from API`);
        fetchAgents(agentQuery); // Refresh from DB
      }
    } catch (error) {
      toast.error('Failed to search agents');
      console.error(error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Search agencies via API
  const searchAgenciesAPI = async () => {
    if (!agencyQuery.trim()) {
      fetchAgencies();
      return;
    }
    
    setIsLoadingAgencies(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'search_agencies', query: agencyQuery },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Found ${data.agencies?.length || 0} agencies from API`);
        fetchAgencies(agencyQuery); // Refresh from DB
      }
    } catch (error) {
      toast.error('Failed to search agencies');
      console.error(error);
    } finally {
      setIsLoadingAgencies(false);
    }
  };

  const toggleRoom = (room: number) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
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
    <AdminLayout title="Bayut API Sync (v2)">
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
                    {isConnected === null ? 'Not Tested' : isConnected ? 'Connected (v2)' : 'Disconnected'}
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
                  <p className="font-semibold">{totalStats.totalApiCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Connection */}
        <Card>
          <CardContent className="pt-6">
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
                  Test API Connection
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList>
            <TabsTrigger value="properties">Properties Sync</TabsTrigger>
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            <TabsTrigger value="agencies">Agencies ({agencies.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="developers">Developers</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Search
                </CardTitle>
                <CardDescription>
                  Search for locations by name to get their IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search location (e.g., Dubai Marina, Downtown...)"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchLocations()}
                  />
                  <Button onClick={searchLocations} disabled={isSearchingLocations}>
                    {isSearchingLocations ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {locationResults.length > 0 && (
                  <div className="border rounded-md p-2 space-y-1 max-h-48 overflow-y-auto">
                    {locationResults.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => addLocation(loc)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-muted flex justify-between items-center"
                      >
                        <span>{loc.name}</span>
                        <Badge variant="outline" className="text-xs">{loc.level}</Badge>
                      </button>
                    ))}
                  </div>
                )}

                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((loc) => (
                      <Badge key={loc.id} variant="secondary" className="flex items-center gap-1">
                        {loc.name}
                        <button onClick={() => removeLocation(loc.id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Filters</CardTitle>
                <CardDescription>
                  Configure search filters for property sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Purpose</label>
                    <Select value={purpose} onValueChange={(v) => setPurpose(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for-sale">For Sale</SelectItem>
                        <SelectItem value="for-rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                        <SelectItem value="apartments">Apartments</SelectItem>
                        <SelectItem value="villas">Villas</SelectItem>
                        <SelectItem value="townhouses">Townhouses</SelectItem>
                        <SelectItem value="penthouses">Penthouses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Completion</label>
                    <Select value={completionStatus} onValueChange={setCompletionStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="off_plan">Off-Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sale Type</label>
                    <Select value={saleType} onValueChange={setSaleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="resale">Resale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((room) => (
                      <button
                        key={room}
                        onClick={() => toggleRoom(room)}
                        className={`px-3 py-1 rounded border text-sm ${
                          selectedRooms.includes(room)
                            ? 'bg-gold text-primary-foreground border-gold'
                            : 'border-border hover:border-gold/50'
                        }`}
                      >
                        {room === 0 ? 'Studio' : `${room} BR`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price & Area */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Price (AED)</label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Price (AED)</label>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Area (sqft)</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={areaMin}
                      onChange={(e) => setAreaMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Area (sqft)</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={areaMax}
                      onChange={(e) => setAreaMax(e.target.value)}
                    />
                  </div>
                </div>

                {/* Media Requirements */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Media Requirements</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={hasVideo} onCheckedChange={(c) => setHasVideo(!!c)} />
                      <span className="text-sm">Has Video</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={hasPanorama} onCheckedChange={(c) => setHasPanorama(!!c)} />
                      <span className="text-sm">Has 360° Tour</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={hasFloorplan} onCheckedChange={(c) => setHasFloorplan(!!c)} />
                      <span className="text-sm">Has Floor Plans</span>
                    </label>
                  </div>
                </div>

                {/* Sort & Limit */}
                <div className="flex flex-wrap gap-4 items-end border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortIndex} onValueChange={setSortIndex}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="area-asc">Area: Small to Large</SelectItem>
                        <SelectItem value="area-desc">Area: Large to Small</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Limit</label>
                    <Select value={String(propertyLimit)} onValueChange={(v) => setPropertyLimit(Number(v))}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={syncProperties} 
                    disabled={isSyncing || selectedLocations.length === 0}
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
                        Sync Properties
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Transactions
                </CardTitle>
                <CardDescription>
                  View real transaction data for market analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={txStartDate}
                      onChange={(e) => setTxStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={txEndDate}
                      onChange={(e) => setTxEndDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchTransactions} disabled={isLoadingTransactions}>
                    {isLoadingTransactions ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Fetch Transactions
                  </Button>
                </div>

                {transactions.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rooms</TableHead>
                        <TableHead>Area (sqft)</TableHead>
                        <TableHead className="text-right">Price (AED)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.location}</TableCell>
                          <TableCell className="capitalize">{tx.property_type}</TableCell>
                          <TableCell>{tx.rooms === 0 ? 'Studio' : `${tx.rooms} BR`}</TableCell>
                          <TableCell>{tx.area?.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">
                            {tx.price?.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developers Tab */}
          <TabsContent value="developers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Developer Search
                </CardTitle>
                <CardDescription>
                  Search for developers and their project portfolios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search developer (e.g., Emaar, DAMAC...)"
                    value={developerQuery}
                    onChange={(e) => setDeveloperQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDevelopers()}
                  />
                  <Button onClick={searchDevelopers} disabled={isLoadingDevelopers}>
                    {isLoadingDevelopers ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {developers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {developers.map((dev) => (
                      <Card key={dev.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            {dev.logo ? (
                              <img src={dev.logo} alt={dev.name} className="h-12 w-12 object-contain rounded" />
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold">{dev.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {dev.projects_count || 0} projects • {dev.properties_count || 0} listings
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
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
                        <TableHead>Location</TableHead>
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
                          <TableCell className="max-w-[200px] truncate">{log.area_name || '-'}</TableCell>
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
