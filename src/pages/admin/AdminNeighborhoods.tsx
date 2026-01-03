import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, MapPin, Search, 
  GraduationCap, Utensils, Building2, ChevronRight, Sparkles, Loader2,
  Zap, Square, CheckCircle2, XCircle, Globe, Download
} from 'lucide-react';
import { useGeoapify } from '@/hooks/useGeoapify';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Link } from 'react-router-dom';

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  overview: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  lifestyle_type: string | null;
  is_freehold: boolean | null;
  golden_visa_eligible: boolean | null;
  has_metro_access: boolean | null;
  has_beach_access: boolean | null;
  has_mall_access: boolean | null;
  avg_price_sqft: number | null;
  avg_rental_yield: number | null;
  yoy_appreciation: number | null;
  walkability_score: number | null;
  transit_score: number | null;
  safety_score: number | null;
  pros: string[];
  cons: string[];
  best_for: string[];
  developer_name: string | null;
  established_year: number | null;
  population_estimate: number | null;
  is_published: boolean | null;
}

const lifestyleOptions = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'family', label: 'Family' },
  { value: 'affordable', label: 'Affordable' },
  { value: 'urban', label: 'Urban' },
  { value: 'emerging', label: 'Emerging' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed', label: 'Mixed' },
];

const emptyNeighborhood: Partial<Neighborhood> = {
  name: '',
  slug: '',
  description: '',
  overview: '',
  image_url: '',
  cover_image_url: '',
  lifestyle_type: 'mixed',
  is_freehold: true,
  golden_visa_eligible: true,
  has_metro_access: false,
  has_beach_access: false,
  has_mall_access: false,
  avg_price_sqft: undefined,
  avg_rental_yield: undefined,
  yoy_appreciation: undefined,
  walkability_score: undefined,
  transit_score: undefined,
  safety_score: undefined,
  pros: [],
  cons: [],
  best_for: [],
  developer_name: '',
  established_year: undefined,
  population_estimate: undefined,
  is_published: false,
};

export default function AdminNeighborhoods() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Partial<Neighborhood> | null>(null);
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [bestForInput, setBestForInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Bulk generation state
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, failed: 0 });
  const bulkAbortRef = useRef(false);
  
  // Geoapify integration
  const { geocodeNeighborhood, fetchNeighborhoodPOIs, isGeocoding, isFetchingPOIs } = useGeoapify();
  const [geocodingId, setGeocodingId] = useState<string | null>(null);
  const [fetchingPOIsId, setFetchingPOIsId] = useState<string | null>(null);

  const handleGeocode = async (neighborhood: Neighborhood) => {
    setGeocodingId(neighborhood.id);
    const result = await geocodeNeighborhood(neighborhood.id, neighborhood.name);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['admin-neighborhoods'] });
    }
    setGeocodingId(null);
  };

  const handleFetchPOIs = async (neighborhood: Neighborhood) => {
    if (!neighborhood.latitude || !neighborhood.longitude) {
      toast.error('Please geocode the neighborhood first');
      return;
    }
    setFetchingPOIsId(neighborhood.id);
    await fetchNeighborhoodPOIs(
      neighborhood.id,
      neighborhood.latitude,
      neighborhood.longitude
    );
    setFetchingPOIsId(null);
  };

  const { data: neighborhoods, isLoading } = useQuery({
    queryKey: ['admin-neighborhoods', search],
    queryFn: async () => {
      let query = supabase
        .from('neighborhoods')
        .select('*')
        .order('name');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(n => ({
        ...n,
        pros: Array.isArray(n.pros) ? n.pros : [],
        cons: Array.isArray(n.cons) ? n.cons : [],
        best_for: Array.isArray(n.best_for) ? n.best_for : [],
      })) as Neighborhood[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Neighborhood>) => {
      const payload = {
        ...data,
        slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: data.name || '',
      };

      if (data.id) {
        const { error } = await supabase
          .from('neighborhoods')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('neighborhoods')
          .insert([payload] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-neighborhoods'] });
      setIsDialogOpen(false);
      setEditingNeighborhood(null);
      toast.success('Neighborhood saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('neighborhoods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-neighborhoods'] });
      toast.success('Neighborhood deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('neighborhoods')
      .update({ is_published: !current })
      .eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-neighborhoods'] });
      toast.success(current ? 'Unpublished' : 'Published');
    }
  };

  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood);
    setProsInput(neighborhood.pros?.join('\n') || '');
    setConsInput(neighborhood.cons?.join('\n') || '');
    setBestForInput(neighborhood.best_for?.join('\n') || '');
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingNeighborhood({ ...emptyNeighborhood });
    setProsInput('');
    setConsInput('');
    setBestForInput('');
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingNeighborhood) return;
    saveMutation.mutate({
      ...editingNeighborhood,
      pros: prosInput.split('\n').map(s => s.trim()).filter(Boolean),
      cons: consInput.split('\n').map(s => s.trim()).filter(Boolean),
      best_for: bestForInput.split('\n').map(s => s.trim()).filter(Boolean),
    });
  };

  const updateField = (field: keyof Neighborhood, value: any) => {
    if (!editingNeighborhood) return;
    setEditingNeighborhood({ ...editingNeighborhood, [field]: value });
  };

  const generateAIContent = async () => {
    if (!editingNeighborhood?.name) {
      toast.error('Please enter a neighborhood name first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-neighborhood-content', {
        body: {
          neighborhoodName: editingNeighborhood.name,
          lifestyleType: editingNeighborhood.lifestyle_type,
          isFreehold: editingNeighborhood.is_freehold,
          hasMetro: editingNeighborhood.has_metro_access,
          hasBeach: editingNeighborhood.has_beach_access,
        },
      });

      if (error) throw error;

      if (data) {
        setEditingNeighborhood({
          ...editingNeighborhood,
          overview: data.overview || editingNeighborhood.overview,
        });
        setProsInput(data.pros?.join('\n') || prosInput);
        setConsInput(data.cons?.join('\n') || consInput);
        setBestForInput(data.best_for?.join('\n') || bestForInput);
        toast.success('AI content generated! Review and edit as needed.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI content. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Bulk generate AI content for all neighborhoods without content
  const startBulkGeneration = async () => {
    if (!neighborhoods) return;
    
    const needsContent = neighborhoods.filter(n => !n.overview || n.overview.trim() === '');
    if (needsContent.length === 0) {
      toast.info('All neighborhoods already have content');
      return;
    }

    setIsBulkGenerating(true);
    bulkAbortRef.current = false;
    setBulkProgress({ current: 0, total: needsContent.length, failed: 0 });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < needsContent.length; i++) {
      if (bulkAbortRef.current) {
        toast.info(`Bulk generation stopped at ${i}/${needsContent.length}`);
        break;
      }

      const neighborhood = needsContent[i];
      setBulkProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        // Call AI edge function
        const { data, error } = await supabase.functions.invoke('ai-neighborhood-content', {
          body: {
            neighborhoodName: neighborhood.name,
            lifestyleType: neighborhood.lifestyle_type,
            isFreehold: neighborhood.is_freehold,
            hasMetro: neighborhood.has_metro_access,
            hasBeach: neighborhood.has_beach_access,
          },
        });

        if (error) throw error;

        if (data) {
          // Update database directly
          const { error: updateError } = await supabase
            .from('neighborhoods')
            .update({
              overview: data.overview,
              pros: data.pros || [],
              cons: data.cons || [],
              best_for: data.best_for || [],
            })
            .eq('id', neighborhood.id);

          if (updateError) throw updateError;
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to generate content for ${neighborhood.name}:`, error);
        failCount++;
        setBulkProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Rate limiting: wait 600ms between requests
      if (i < needsContent.length - 1 && !bulkAbortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    setIsBulkGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['admin-neighborhoods'] });
    
    if (!bulkAbortRef.current) {
      toast.success(`Bulk generation complete! ${successCount} succeeded, ${failCount} failed.`);
    }
  };

  const stopBulkGeneration = () => {
    bulkAbortRef.current = true;
  };

  const neighborhoodsWithoutContent = neighborhoods?.filter(n => !n.overview || n.overview.trim() === '').length || 0;

  return (
    <AdminLayout title="Neighborhoods">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search neighborhoods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Neighborhood
            </Button>
          </div>
        </div>

        {/* Bulk Generation Card */}
        {neighborhoodsWithoutContent > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Bulk AI Content Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      {neighborhoodsWithoutContent} neighborhoods need content
                    </p>
                  </div>
                </div>
                
                {isBulkGenerating ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {bulkProgress.current}/{bulkProgress.total}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bulkProgress.failed > 0 && `${bulkProgress.failed} failed`}
                      </p>
                    </div>
                    <div className="w-32">
                      <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="h-2" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={stopBulkGeneration}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                ) : (
                  <Button onClick={startBulkGeneration} className="gap-2">
                    <Zap className="h-4 w-4" />
                    Generate All Content
                  </Button>
                )}
              </div>
              
              {isBulkGenerating && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Generating content for: {neighborhoods?.find(n => !n.overview)?.name || '...'}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{neighborhoods?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{neighborhoods?.filter(n => n.is_published).length || 0}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{neighborhoods?.filter(n => n.is_freehold).length || 0}</p>
              <p className="text-sm text-muted-foreground">Freehold</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{neighborhoods?.filter(n => n.has_metro_access).length || 0}</p>
              <p className="text-sm text-muted-foreground">Metro Access</p>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : neighborhoods && neighborhoods.length > 0 ? (
            neighborhoods.map((neighborhood) => (
              <Card key={neighborhood.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {neighborhood.image_url ? (
                        <img src={neighborhood.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{neighborhood.name}</h3>
                        <Badge variant={neighborhood.is_published ? 'default' : 'secondary'}>
                          {neighborhood.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        {neighborhood.lifestyle_type && (
                          <Badge variant="outline">{neighborhood.lifestyle_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {neighborhood.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {neighborhood.latitude && neighborhood.longitude ? (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            Geocoded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500">
                            <XCircle className="h-3 w-3" />
                            Not geocoded
                          </span>
                        )}
                        {neighborhood.is_freehold && <span>• Freehold</span>}
                        {neighborhood.has_metro_access && <span>• Metro</span>}
                        {neighborhood.has_beach_access && <span>• Beach</span>}
                        {neighborhood.avg_price_sqft && (
                          <span>• AED {neighborhood.avg_price_sqft.toLocaleString()}/sqft</span>
                        )}
                      </div>
                    </div>

                    {/* Geoapify Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGeocode(neighborhood)}
                        disabled={geocodingId === neighborhood.id}
                        className="gap-1.5 text-xs"
                        title="Geocode to get coordinates"
                      >
                        {geocodingId === neighborhood.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        Geocode
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFetchPOIs(neighborhood)}
                        disabled={fetchingPOIsId === neighborhood.id || !neighborhood.latitude}
                        className="gap-1.5 text-xs"
                        title="Fetch POIs from Geoapify"
                      >
                        {fetchingPOIsId === neighborhood.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Fetch POIs
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublish(neighborhood.id, neighborhood.is_published || false)}
                        title={neighborhood.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {neighborhood.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Manage POIs">
                        <Link to={`/admin/neighborhoods/${neighborhood.id}/pois`}>
                          <Building2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(neighborhood)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {neighborhood.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this neighborhood and all its POI data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(neighborhood.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-12">No neighborhoods found.</p>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNeighborhood?.id ? 'Edit Neighborhood' : 'Add Neighborhood'}
            </DialogTitle>
          </DialogHeader>

          {editingNeighborhood && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editingNeighborhood.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Dubai Marina"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={editingNeighborhood.slug || ''}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="dubai-marina"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea
                    value={editingNeighborhood.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="A vibrant waterfront community..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lifestyle Type</Label>
                    <Select
                      value={editingNeighborhood.lifestyle_type || 'mixed'}
                      onValueChange={(v) => updateField('lifestyle_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lifestyleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Developer</Label>
                    <Input
                      value={editingNeighborhood.developer_name || ''}
                      onChange={(e) => updateField('developer_name', e.target.value)}
                      placeholder="Emaar"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <ImageUploader
                      currentImageUrl={editingNeighborhood.image_url || null}
                      onUpload={(url) => updateField('image_url', url)}
                      bucket="property-media"
                      folder={`neighborhoods/${editingNeighborhood.id || 'new'}`}
                      aspectRatio={4/3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <ImageUploader
                      currentImageUrl={editingNeighborhood.cover_image_url || null}
                      onUpload={(url) => updateField('cover_image_url', url)}
                      bucket="property-media"
                      folder={`neighborhoods/${editingNeighborhood.id || 'new'}`}
                      aspectRatio={16/9}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.is_freehold || false}
                      onCheckedChange={(v) => updateField('is_freehold', v)}
                    />
                    <Label>Freehold</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.golden_visa_eligible || false}
                      onCheckedChange={(v) => updateField('golden_visa_eligible', v)}
                    />
                    <Label>Golden Visa Eligible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.has_metro_access || false}
                      onCheckedChange={(v) => updateField('has_metro_access', v)}
                    />
                    <Label>Metro Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.has_beach_access || false}
                      onCheckedChange={(v) => updateField('has_beach_access', v)}
                    />
                    <Label>Beach Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.has_mall_access || false}
                      onCheckedChange={(v) => updateField('has_mall_access', v)}
                    />
                    <Label>Mall Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingNeighborhood.is_published || false}
                      onCheckedChange={(v) => updateField('is_published', v)}
                    />
                    <Label>Published</Label>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Walkability Score (0-100)</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.walkability_score || ''}
                      onChange={(e) => updateField('walkability_score', e.target.value ? parseInt(e.target.value) : null)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transit Score (0-100)</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.transit_score || ''}
                      onChange={(e) => updateField('transit_score', e.target.value ? parseInt(e.target.value) : null)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Safety Score (0-100)</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.safety_score || ''}
                      onChange={(e) => updateField('safety_score', e.target.value ? parseInt(e.target.value) : null)}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Established Year</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.established_year || ''}
                      onChange={(e) => updateField('established_year', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Population Estimate</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.population_estimate || ''}
                      onChange={(e) => updateField('population_estimate', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investment" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Avg. Price/sqft (AED)</Label>
                    <Input
                      type="number"
                      value={editingNeighborhood.avg_price_sqft || ''}
                      onChange={(e) => updateField('avg_price_sqft', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg. Rental Yield (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingNeighborhood.avg_rental_yield || ''}
                      onChange={(e) => updateField('avg_rental_yield', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YoY Appreciation (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingNeighborhood.yoy_appreciation || ''}
                      onChange={(e) => updateField('yoy_appreciation', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                {/* AI Generate Button */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Content Generator
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Generate overview, pros, cons, and best-for content using AI
                    </p>
                  </div>
                  <Button 
                    onClick={generateAIContent}
                    disabled={isGeneratingAI || !editingNeighborhood.name}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Overview (Long Description)</Label>
                  <Textarea
                    value={editingNeighborhood.overview || ''}
                    onChange={(e) => updateField('overview', e.target.value)}
                    placeholder="Detailed overview of the neighborhood..."
                    rows={6}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pros (one per line)</Label>
                    <Textarea
                      value={prosInput}
                      onChange={(e) => setProsInput(e.target.value)}
                      placeholder="Great amenities&#10;Beach access&#10;High rental demand"
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cons (one per line)</Label>
                    <Textarea
                      value={consInput}
                      onChange={(e) => setConsInput(e.target.value)}
                      placeholder="Traffic congestion&#10;Higher prices&#10;Limited parking"
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Best For (one per line)</Label>
                    <Textarea
                      value={bestForInput}
                      onChange={(e) => setBestForInput(e.target.value)}
                      placeholder="Young Professionals&#10;Families&#10;Investors"
                      rows={5}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
