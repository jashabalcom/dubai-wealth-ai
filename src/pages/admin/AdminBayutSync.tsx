import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Users,
  StopCircle,
  PlayCircle,
  TestTube2,
  HardDrive,
  Rocket,
  Settings2,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { SyncScheduleTab } from '@/components/admin/SyncScheduleTab';

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

// Top 25 Dubai investment areas with their CORRECT Bayut RapidAPI location IDs
// These IDs were verified against the actual API on 2026-01-02
const TOP_DUBAI_AREAS = [
  { id: 36, name: 'Dubai Marina', level: 'community' },
  { id: 10, name: 'Downtown Dubai', level: 'community' },
  { id: 14, name: 'Palm Jumeirah', level: 'community' },
  { id: 87, name: 'Jumeirah Beach Residence (JBR)', level: 'community' },
  { id: 54, name: 'Business Bay', level: 'community' },
  { id: 59, name: 'Jumeirah Village Circle (JVC)', level: 'community' },
  { id: 53, name: 'Dubai Hills Estate', level: 'community' },
  { id: 168, name: 'Arabian Ranches', level: 'community' },
  { id: 302, name: 'Mohammed Bin Rashid City', level: 'community' },
  { id: 117, name: 'DIFC', level: 'community' },
  { id: 12, name: 'Jumeirah Lake Towers (JLT)', level: 'community' },
  { id: 67, name: 'Dubai Sports City', level: 'community' },
  { id: 295, name: 'Dubai Silicon Oasis', level: 'community' },
  { id: 279, name: 'DAMAC Hills', level: 'community' },
  { id: 835, name: 'Sobha Hartland', level: 'community' },
  { id: 164, name: 'Emirates Hills', level: 'community' },
  { id: 386, name: 'Town Square', level: 'community' },
  { id: 105, name: 'Al Barsha', level: 'community' },
  { id: 268, name: 'Motor City', level: 'community' },
  { id: 23, name: 'Jumeirah', level: 'community' },
  { id: 43, name: 'Meydan City', level: 'community' },
  { id: 368, name: 'International City', level: 'community' },
  { id: 79, name: 'Dubai Investment Park', level: 'community' },
  { id: 242, name: 'Dubai Creek Harbour', level: 'community' },
  { id: 1754, name: 'Bluewaters Island', level: 'community' },
];

export default function AdminBayutSync() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isQuickSyncing, setIsQuickSyncing] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [quickSyncProgress, setQuickSyncProgress] = useState({ 
    current: 0, 
    total: 0, 
    currentArea: '',
    propertiesSynced: 0,
    photosRehosted: 0,
    photosCdn: 0,
    agentsDiscovered: 0,
    agenciesDiscovered: 0,
  });
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSynced: 0,
    totalPhotos: 0,
    totalApiCalls: 0,
  });
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dryRunResults, setDryRunResults] = useState<{ area: string; count: number }[]>([]);
  const [estimatedTotalProperties, setEstimatedTotalProperties] = useState(0);
  
  // Scale Sync (10K) state
  const [isScaleSyncing, setIsScaleSyncing] = useState(false);
  const [scaleSyncProgress, setScaleSyncProgress] = useState({
    currentArea: '',
    currentAreaIndex: 0,
    totalAreas: 0,
    totalPropertiesSynced: 0,
    totalApiCalls: 0,
  });
  const [scaleTargetAreas, setScaleTargetAreas] = useState<typeof TOP_DUBAI_AREAS>([...TOP_DUBAI_AREAS]);
  const [scalePagesPerArea, setScalePagesPerArea] = useState(20); // 20 pages = 1000 props per area
  const [scaleLiteMode, setScaleLiteMode] = useState(false); // Default to FULL MODE for quality
  const [scaleIncludeRentals, setScaleIncludeRentals] = useState(true); // Include rentals by default
  const [scaleSkipRecent, setScaleSkipRecent] = useState(false);
  const [showScaleConfirmDialog, setShowScaleConfirmDialog] = useState(false);
  
  // Chunked Sync state (auto-resume)
  const [chunkedProgressId, setChunkedProgressId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup state
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number } | null>(null);
  
  // Abort ref
  const abortRef = useRef(false);

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

  // Dry run to estimate API calls before sync
  const runDryRun = async () => {
    setIsDryRunning(true);
    setDryRunResults([]);
    setEstimatedTotalProperties(0);
    
    const results: { area: string; count: number }[] = [];
    let totalProps = 0;
    
    toast.info(`Running dry run for ${TOP_DUBAI_AREAS.length} areas...`);
    
    for (let i = 0; i < Math.min(TOP_DUBAI_AREAS.length, 5); i++) { // Sample first 5 areas
      const area = TOP_DUBAI_AREAS[i];
      try {
        const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
          body: {
            action: 'sync_properties',
            locations_ids: [area.id],
            purpose: 'for-sale',
            limit: 50,
            dry_run: true,
          },
        });

        if (!error && data?.wouldSync) {
          results.push({ area: area.name, count: data.wouldSync });
          totalProps += data.wouldSync;
        }
      } catch (e) {
        console.error(`Dry run failed for ${area.name}:`, e);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Estimate total based on sample
    const avgPerArea = totalProps / Math.min(5, results.length);
    const estimatedTotal = Math.round(avgPerArea * TOP_DUBAI_AREAS.length);
    
    setDryRunResults(results);
    setEstimatedTotalProperties(estimatedTotal);
    setIsDryRunning(false);
    setShowConfirmDialog(true);
  };

  const abortSync = () => {
    abortRef.current = true;
    toast.warning('Aborting sync after current area completes...');
  };

  // Cleanup non-Dubai properties (Al Helio, Ajman, etc.)
  const cleanupNonDubaiProperties = async () => {
    setIsCleaningUp(true);
    setCleanupResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
        body: { action: 'cleanup_non_dubai' },
      });

      if (error) throw error;

      if (data?.success) {
        setCleanupResult({ deleted: data.deleted });
        toast.success(`Cleaned up ${data.deleted} non-Dubai properties`);
        fetchTotalStats();
      } else {
        toast.error(data?.error || 'Cleanup failed');
      }
    } catch (error) {
      toast.error('Failed to cleanup non-Dubai properties');
      console.error(error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const quickSyncAllAreas = async () => {
    setShowConfirmDialog(false);
    setIsQuickSyncing(true);
    abortRef.current = false;
    setQuickSyncProgress({ 
      current: 0, 
      total: TOP_DUBAI_AREAS.length, 
      currentArea: '',
      propertiesSynced: 0,
      photosRehosted: 0,
      photosCdn: 0,
      agentsDiscovered: 0,
      agenciesDiscovered: 0,
    });
    
    let successCount = 0;
    let failCount = 0;
    let totalPropertiesSynced = 0;
    let totalPhotosRehosted = 0;
    let totalPhotosCdn = 0;
    let totalAgents = 0;
    let totalAgencies = 0;
    
    toast.info(`Starting quick sync of ${TOP_DUBAI_AREAS.length} Dubai areas...`);
    
    for (let i = 0; i < TOP_DUBAI_AREAS.length; i++) {
      // Check for abort
      if (abortRef.current) {
        toast.warning(`Sync aborted after ${i} areas. ${successCount} succeeded, ${failCount} failed.`);
        break;
      }
      
      const area = TOP_DUBAI_AREAS[i];
      setQuickSyncProgress(prev => ({ 
        ...prev,
        current: i + 1, 
        currentArea: area.name 
      }));
      
      try {
        const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
          body: {
            action: 'sync_properties',
            locations_ids: [area.id],
            purpose: 'for-sale',
            index: 'latest',
            limit: 50,
          },
        });

        if (error) throw error;
        
        if (data?.success) {
          successCount++;
          totalPropertiesSynced += data.propertiesSynced || 0;
          totalPhotosRehosted += data.storage?.photosRehosted || 0;
          totalPhotosCdn += data.storage?.photosCdnReferenced || 0;
          totalAgents += data.intelligence?.agentsDiscovered || 0;
          totalAgencies += data.intelligence?.agenciesDiscovered || 0;
          
          // Update live progress
          setQuickSyncProgress(prev => ({
            ...prev,
            propertiesSynced: totalPropertiesSynced,
            photosRehosted: totalPhotosRehosted,
            photosCdn: totalPhotosCdn,
            agentsDiscovered: totalAgents,
            agenciesDiscovered: totalAgencies,
          }));
        } else {
          failCount++;
          console.warn(`Failed to sync ${area.name}:`, data?.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error syncing ${area.name}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsQuickSyncing(false);
    setQuickSyncProgress({ 
      current: 0, 
      total: 0, 
      currentArea: '',
      propertiesSynced: 0,
      photosRehosted: 0,
      photosCdn: 0,
      agentsDiscovered: 0,
      agenciesDiscovered: 0,
    });
    
    fetchSyncLogs();
    fetchTotalStats();
    
    if (failCount === 0 && !abortRef.current) {
      toast.success(`Quick sync complete! Synced ${totalPropertiesSynced} properties from ${successCount} areas.`);
    } else if (!abortRef.current) {
      toast.warning(`Quick sync complete. ${successCount} areas succeeded, ${failCount} failed. ${totalPropertiesSynced} properties synced.`);
    }
  };

  // SCALE SYNC - Chunked sync with auto-resume (Fire-and-Poll)
  const runScaleSync = async (resumeProgressId?: string) => {
    setShowScaleConfirmDialog(false);
    setIsScaleSyncing(true);
    setIsPaused(false);
    abortRef.current = false;
    
    const progressId = resumeProgressId || chunkedProgressId;
    
    if (!progressId) {
      // Starting fresh - initialize progress
      setScaleSyncProgress({
        currentArea: 'Starting...',
        currentAreaIndex: 0,
        totalAreas: scaleTargetAreas.length,
        totalPropertiesSynced: 0,
        totalApiCalls: 0,
      });
    }

    toast.info(`Starting Chunked Sync: ${scaleTargetAreas.length} areas, processing 3 areas at a time...`);

    // Start the chunked sync loop
    const processNextChunk = async (currentProgressId?: string) => {
      if (abortRef.current || isPaused) {
        setIsScaleSyncing(false);
        toast.warning('Sync paused. Click Resume to continue.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('sync-bayut-properties', {
          body: {
            action: 'chunked_sync',
            areas: currentProgressId ? undefined : scaleTargetAreas.map(a => ({ id: a.id, name: a.name })),
            max_pages: scalePagesPerArea,
            lite_mode: scaleLiteMode,
            include_rentals: scaleIncludeRentals,
            progress_id: currentProgressId,
            areas_per_chunk: 3, // Process 3 areas at a time
          },
        });

        if (error) throw error;

        if (data?.success) {
          const progress = data.progress;
          const progressIdFromResponse = data.progress_id;
          
          // Store progress ID for resume
          setChunkedProgressId(progressIdFromResponse);

          // Update UI progress
          const areasConfig = progress?.areas_config || scaleTargetAreas;
          const currentAreaIdx = progress?.current_area_index || 0;
          const currentAreaName = currentAreaIdx < areasConfig.length 
            ? areasConfig[currentAreaIdx]?.name || 'Processing...'
            : 'Completing...';
          
          setScaleSyncProgress({
            currentArea: currentAreaName,
            currentAreaIndex: currentAreaIdx,
            totalAreas: areasConfig.length,
            totalPropertiesSynced: progress?.properties_synced || 0,
            totalApiCalls: progress?.photos_synced || 0,
          });

          // Check if completed
          if (data.completed) {
            setIsScaleSyncing(false);
            setChunkedProgressId(null);
            toast.success(`Scale Sync complete! ${progress?.properties_synced || 0} properties synced.`);
            fetchSyncLogs();
            fetchTotalStats();
            setScaleSyncProgress({
              currentArea: '',
              currentAreaIndex: 0,
              totalAreas: 0,
              totalPropertiesSynced: 0,
              totalApiCalls: 0,
            });
            return;
          }

          // Process next chunk after a short delay
          if (data.next_chunk && !abortRef.current) {
            toast.info(`Chunk done: ${data.chunk_stats?.properties_synced || 0} props. ${data.next_chunk.remaining_areas} areas remaining...`);
            
            // Wait 5 seconds then process next chunk
            setTimeout(() => {
              processNextChunk(progressIdFromResponse);
            }, 5000);
          }
        } else {
          throw new Error(data?.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Chunked sync error:', error);
        toast.error(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}. Will retry...`);
        
        // Retry after delay
        if (!abortRef.current) {
          setTimeout(() => {
            processNextChunk(chunkedProgressId || undefined);
          }, 10000);
        } else {
          setIsScaleSyncing(false);
        }
      }
    };

    // Start processing
    processNextChunk(progressId || undefined);
  };

  // Pause/Resume handlers
  const pauseSync = () => {
    abortRef.current = true;
    setIsPaused(true);
    toast.warning('Pausing sync after current chunk...');
  };

  const resumeSync = () => {
    if (chunkedProgressId) {
      runScaleSync(chunkedProgressId);
    } else {
      toast.error('No sync in progress to resume');
    }
  };

  const toggleScaleArea = (areaId: number) => {
    setScaleTargetAreas(prev => {
      const exists = prev.find(a => a.id === areaId);
      if (exists) {
        return prev.filter(a => a.id !== areaId);
      } else {
        const area = TOP_DUBAI_AREAS.find(a => a.id === areaId);
        return area ? [...prev, area] : prev;
      }
    });
  };

  const selectAllAreas = () => setScaleTargetAreas([...TOP_DUBAI_AREAS]);
  const selectNoAreas = () => setScaleTargetAreas([]);

  const estimatedPropertiesCount = scaleTargetAreas.length * scalePagesPerArea * 50 * (scaleIncludeRentals ? 2 : 1);
  const estimatedApiCalls = scaleLiteMode 
    ? scaleTargetAreas.length * scalePagesPerArea * (scaleIncludeRentals ? 2 : 1)
    : estimatedPropertiesCount + scaleTargetAreas.length * scalePagesPerArea * (scaleIncludeRentals ? 2 : 1);
  
  // Realistic duration estimate (based on API rate limits and image rehosting)
  const estimatedDurationMinutes = scaleLiteMode 
    ? Math.ceil(estimatedPropertiesCount / 500) // ~500 props/min in lite mode
    : Math.ceil(estimatedPropertiesCount / 150); // ~150 props/min in full mode (with 10 photo rehosts)
  const estimatedDurationHours = Math.ceil(estimatedDurationMinutes / 60);
  const durationDisplay = estimatedDurationMinutes < 60 
    ? `~${estimatedDurationMinutes} min` 
    : `~${estimatedDurationHours}-${estimatedDurationHours + 1} hrs`;

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
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="properties">Properties Sync</TabsTrigger>
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            <TabsTrigger value="agencies">Agencies ({agencies.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="developers">Developers</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <SyncScheduleTab />
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            {/* Quick Sync Card */}
            <Card className="border-gold/30 bg-gold/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gold" />
                  Quick Sync All Areas
                </CardTitle>
                <CardDescription>
                  One-click sync of top {TOP_DUBAI_AREAS.length} Dubai investment areas (50 properties each). ~{TOP_DUBAI_AREAS.length} API calls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Dry Run Button */}
                  <Button 
                    onClick={runDryRun} 
                    disabled={isQuickSyncing || isSyncing || isDryRunning}
                    variant="outline"
                  >
                    {isDryRunning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Estimating...
                      </>
                    ) : (
                      <>
                        <TestTube2 className="h-4 w-4 mr-2" />
                        Test Sync (Dry Run)
                      </>
                    )}
                  </Button>

                  {/* Quick Sync Button */}
                  <Button 
                    onClick={() => setShowConfirmDialog(true)} 
                    disabled={isQuickSyncing || isSyncing || isDryRunning}
                    className="bg-gold hover:bg-gold/90 text-primary-foreground"
                    size="lg"
                  >
                    {isQuickSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing {quickSyncProgress.current}/{quickSyncProgress.total}...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Quick Sync All Areas
                      </>
                    )}
                  </Button>
                  
                  {/* Abort Button */}
                  {isQuickSyncing && (
                    <Button 
                      onClick={abortSync}
                      variant="destructive"
                      size="lg"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Abort Sync
                    </Button>
                  )}
                </div>

                {/* Live Progress */}
                {isQuickSyncing && (
                  <div className="space-y-4 p-4 rounded-lg border bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Syncing: <span className="text-gold">{quickSyncProgress.currentArea}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {quickSyncProgress.current}/{quickSyncProgress.total} areas
                      </span>
                    </div>
                    <Progress value={(quickSyncProgress.current / quickSyncProgress.total) * 100} className="h-2" />
                    
                    {/* Live Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gold">{quickSyncProgress.propertiesSynced}</p>
                        <p className="text-xs text-muted-foreground">Properties Synced</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{quickSyncProgress.photosRehosted}</p>
                        <p className="text-xs text-muted-foreground">Photos Re-hosted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">{quickSyncProgress.photosCdn}</p>
                        <p className="text-xs text-muted-foreground">Photos CDN</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-500">{quickSyncProgress.agentsDiscovered}</p>
                        <p className="text-xs text-muted-foreground">Agents Found</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">{quickSyncProgress.agenciesDiscovered}</p>
                        <p className="text-xs text-muted-foreground">Agencies Found</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1.5">
                  {TOP_DUBAI_AREAS.map((area, idx) => (
                    <Badge 
                      key={area.id} 
                      variant="outline" 
                      className={`text-xs ${
                        isQuickSyncing && quickSyncProgress.currentArea === area.name 
                          ? 'bg-gold/20 border-gold text-gold animate-pulse' 
                          : isQuickSyncing && idx < quickSyncProgress.current - 1
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : ''
                      }`}
                    >
                      {isQuickSyncing && idx < quickSyncProgress.current - 1 && (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {area.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CLEANUP NON-DUBAI PROPERTIES */}
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  Cleanup Non-Dubai Properties
                </CardTitle>
                <CardDescription>
                  Remove properties from Al Helio, Ajman, Sharjah, and other non-Dubai emirates that may have been synced.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={cleanupNonDubaiProperties} 
                    disabled={isCleaningUp || isQuickSyncing || isScaleSyncing}
                    variant="destructive"
                  >
                    {isCleaningUp ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cleaning Up...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Delete Non-Dubai Properties
                      </>
                    )}
                  </Button>
                  
                  {cleanupResult && (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Deleted {cleanupResult.deleted} properties
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  This will delete all properties with location_area or title containing: Ajman, Al Helio, Sharjah, etc.
                </p>
              </CardContent>
            </Card>

            {/* 30K QUALITY SYNC - Premium Preset */}
            <Card className="border-gold/50 bg-gold/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-gold" />
                  🚀 30K Quality Sync (Recommended)
                </CardTitle>
                <CardDescription>
                  Premium sync: 25 areas × 20 pages × 50 properties + rentals = 50,000 potential listings. FULL MODE with 10 photos/property. ~3-4 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg bg-background/50 border border-gold/30">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">25</p>
                    <p className="text-xs text-muted-foreground">Dubai Areas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">50,000</p>
                    <p className="text-xs text-muted-foreground">Potential Props</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">~300K+</p>
                    <p className="text-xs text-muted-foreground">Photos (10/prop)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-500">Full Mode</p>
                    <p className="text-xs text-muted-foreground">Quality Data</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-500">~3-4 hrs</p>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setScaleTargetAreas([...TOP_DUBAI_AREAS]);
                    setScalePagesPerArea(20); // Max pages per area
                    setScaleLiteMode(false); // FULL MODE for quality
                    setScaleIncludeRentals(true); // Include rentals (doubles count)
                    setScaleSkipRecent(false);
                    setShowScaleConfirmDialog(true);
                  }} 
                  disabled={isScaleSyncing || isQuickSyncing || isPaused}
                  className="bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-black w-full"
                  size="lg"
                >
                  {isScaleSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing: {scaleSyncProgress.currentAreaIndex}/{scaleSyncProgress.totalAreas} areas ({scaleSyncProgress.totalPropertiesSynced.toLocaleString()} props)
                    </>
                  ) : isPaused ? (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Resume Sync ({scaleSyncProgress.totalPropertiesSynced.toLocaleString()} props done)
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Start 30K Quality Sync
                    </>
                  )}
                </Button>
                
                {/* Progress Bar when syncing */}
                {(isScaleSyncing || isPaused) && scaleSyncProgress.totalAreas > 0 && (
                  <div className="space-y-2 mt-4">
                    <Progress 
                      value={(scaleSyncProgress.currentAreaIndex / scaleSyncProgress.totalAreas) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Area: {scaleSyncProgress.currentArea}</span>
                      <span>{scaleSyncProgress.currentAreaIndex}/{scaleSyncProgress.totalAreas} areas</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-500">{scaleSyncProgress.totalPropertiesSynced.toLocaleString()} properties synced</span>
                      {isPaused && <span className="text-amber-500">PAUSED - Click Resume to continue</span>}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  Uses CHUNKED sync (3 areas at a time) for reliability. Rehosts 10 photos per property. Auto-resumes on page refresh.
                </p>
              </CardContent>
            </Card>

            {/* SCALE TO 10K - Bulk Sync (Custom) */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-emerald-500" />
                  Custom Scale Sync
                </CardTitle>
                <CardDescription>
                  Advanced bulk sync with customizable options. Use lite mode for faster syncing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sync Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Target className="h-3 w-3" /> Pages per Area
                    </label>
                    <Select 
                      value={String(scalePagesPerArea)} 
                      onValueChange={(v) => setScalePagesPerArea(Number(v))}
                      disabled={isScaleSyncing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 page (50 props)</SelectItem>
                        <SelectItem value="5">5 pages (250 props)</SelectItem>
                        <SelectItem value="10">10 pages (500 props)</SelectItem>
                        <SelectItem value="15">15 pages (750 props)</SelectItem>
                        <SelectItem value="20">20 pages (1000 props)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Lite Mode (Faster)
                    </label>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="lite-mode"
                        checked={scaleLiteMode}
                        onCheckedChange={(checked) => setScaleLiteMode(!!checked)}
                        disabled={isScaleSyncing}
                      />
                      <label htmlFor="lite-mode" className="text-sm text-muted-foreground">
                        1 photo only (faster)
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {scaleLiteMode ? '⚡ Fast: 1 photo/prop' : '📸 Quality: 10 photos/prop'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Include Rentals</label>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="include-rentals"
                        checked={scaleIncludeRentals}
                        onCheckedChange={(checked) => setScaleIncludeRentals(!!checked)}
                        disabled={isScaleSyncing}
                      />
                      <label htmlFor="include-rentals" className="text-sm text-muted-foreground">
                        Sync for-rent too
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Force Re-sync</label>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="skip-recent"
                        checked={scaleSkipRecent}
                        onCheckedChange={(checked) => setScaleSkipRecent(!!checked)}
                        disabled={isScaleSyncing}
                      />
                      <label htmlFor="skip-recent" className="text-sm text-muted-foreground">
                        Skip 24h check
                      </label>
                    </div>
                  </div>
                </div>

                {/* Estimates */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg bg-background/50 border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-500">{scaleTargetAreas.length}</p>
                    <p className="text-xs text-muted-foreground">Areas Selected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{estimatedPropertiesCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Est. Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      {scaleLiteMode ? '~1/prop' : '~10/prop'}
                    </p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">
                      {scaleLiteMode ? 'Lite' : 'Full'}
                    </p>
                    <p className="text-xs text-muted-foreground">Mode</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-500">{durationDisplay}</p>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                  </div>
                </div>

                {/* Area Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Target Areas</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={selectAllAreas}
                        disabled={isScaleSyncing}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={selectNoAreas}
                        disabled={isScaleSyncing}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {TOP_DUBAI_AREAS.map((area) => {
                      const isSelected = scaleTargetAreas.some(a => a.id === area.id);
                      return (
                        <Badge 
                          key={area.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => !isScaleSyncing && toggleScaleArea(area.id)}
                        >
                          {isSelected && <CheckCircle className="h-3 w-3 mr-1" />}
                          {area.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {!isScaleSyncing && !isPaused && (
                    <Button 
                      onClick={() => setShowScaleConfirmDialog(true)} 
                      disabled={scaleTargetAreas.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="lg"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Start Scale Sync ({estimatedPropertiesCount.toLocaleString()} props)
                    </Button>
                  )}
                  
                  {isScaleSyncing && (
                    <>
                      <Button 
                        onClick={pauseSync}
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Pause Sync
                      </Button>
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Syncing in progress...
                      </Badge>
                    </>
                  )}
                  
                  {isPaused && chunkedProgressId && (
                    <Button 
                      onClick={resumeSync}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Resume Sync
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                Confirm Quick Sync
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    You're about to sync properties from {TOP_DUBAI_AREAS.length} Dubai areas.
                  </p>
                  
                  <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Areas to sync:</span>
                      <span className="font-semibold">{TOP_DUBAI_AREAS.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Properties per area:</span>
                      <span className="font-semibold">50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estimated API calls:</span>
                      <span className="font-semibold text-amber-500">{TOP_DUBAI_AREAS.length}</span>
                    </div>
                    {estimatedTotalProperties > 0 && (
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm">Est. total properties:</span>
                        <span className="font-semibold text-gold">~{estimatedTotalProperties}</span>
                      </div>
                    )}
                  </div>

                  {dryRunResults.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Sample results from dry run:</p>
                      {dryRunResults.map(r => (
                        <div key={r.area} className="flex justify-between">
                          <span>{r.area}:</span>
                          <span>{r.count} properties</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Manual properties will <span className="font-medium text-foreground">not</span> be affected.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={quickSyncAllAreas}
                className="bg-gold hover:bg-gold/90 text-primary-foreground"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Sync
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Scale Sync Confirmation Dialog */}
        <AlertDialog open={showScaleConfirmDialog} onOpenChange={setShowScaleConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-emerald-500" />
                Scale Sync to {estimatedPropertiesCount.toLocaleString()} Properties?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>This will sync properties from {scaleTargetAreas.length} areas with {scalePagesPerArea} pages each.</p>
                  
                  <div className="p-3 bg-muted rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Areas selected:</span>
                      <span className="font-semibold">{scaleTargetAreas.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pages per area:</span>
                      <span className="font-semibold">{scalePagesPerArea}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mode:</span>
                      <Badge variant={scaleLiteMode ? "secondary" : "default"}>
                        {scaleLiteMode ? 'Lite (Fast)' : 'Full (With Photos)'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Include rentals:</span>
                      <span className="font-semibold">{scaleIncludeRentals ? 'Yes (2x)' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm">Est. properties:</span>
                      <span className="font-semibold text-emerald-500">{estimatedPropertiesCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Est. API calls:</span>
                      <span className="font-semibold text-amber-500">{estimatedApiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Est. duration:</span>
                      <span className="font-semibold">{scaleLiteMode ? '~5 min' : '~30 min'}</span>
                    </div>
                  </div>

                  {scaleLiteMode && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-md border border-blue-500/30">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-400">
                        <strong>Lite Mode:</strong> Syncs quickly using search results only. Photos will reference Bayut CDN instead of being re-hosted.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => runScaleSync()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Start Scale Sync
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
