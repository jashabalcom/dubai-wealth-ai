import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft, Star, GraduationCap, Utensils, Building2, Train, Waves, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface POI {
  id: string;
  neighborhood_id: string;
  poi_type: string;
  name: string;
  description: string | null;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  price_level: string | null;
  curriculum: string | null;
  grade_levels: string | null;
  annual_fees_from: number | null;
  annual_fees_to: number | null;
  cuisine: string | null;
  is_delivery_available: boolean | null;
  website_url: string | null;
  phone: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  order_index: number | null;
}

const poiTypes = [
  { value: 'school', label: 'School', icon: GraduationCap },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'mall', label: 'Mall/Shopping', icon: Building2 },
  { value: 'metro', label: 'Metro Station', icon: Train },
  { value: 'beach', label: 'Beach', icon: Waves },
  { value: 'park', label: 'Park', icon: TreePine },
  { value: 'gym', label: 'Gym/Fitness', icon: Building2 },
  { value: 'hospital', label: 'Hospital/Clinic', icon: Building2 },
];

const curriculumOptions = ['IB', 'British', 'American', 'Indian', 'French', 'German', 'CBSE', 'MOE'];
const priceLevels = ['$', '$$', '$$$', '$$$$'];

const emptyPOI: Partial<POI> = {
  poi_type: 'school',
  name: '',
  description: '',
  address: '',
  rating: undefined,
  review_count: undefined,
  price_level: '',
  curriculum: '',
  grade_levels: '',
  annual_fees_from: undefined,
  annual_fees_to: undefined,
  cuisine: '',
  is_delivery_available: false,
  website_url: '',
  phone: '',
  image_url: '',
  is_featured: false,
  order_index: 0,
};

export default function AdminNeighborhoodPOIs() {
  const { neighborhoodId } = useParams<{ neighborhoodId: string }>();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<Partial<POI> | null>(null);

  // Fetch neighborhood info
  const { data: neighborhood } = useQuery({
    queryKey: ['neighborhood-info', neighborhoodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name, slug')
        .eq('id', neighborhoodId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!neighborhoodId,
  });

  // Fetch POIs
  const { data: pois, isLoading } = useQuery({
    queryKey: ['neighborhood-pois-admin', neighborhoodId, activeType],
    queryFn: async () => {
      let query = supabase
        .from('neighborhood_pois')
        .select('*')
        .eq('neighborhood_id', neighborhoodId!)
        .order('poi_type')
        .order('order_index');

      if (activeType !== 'all') {
        query = query.eq('poi_type', activeType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as POI[];
    },
    enabled: !!neighborhoodId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<POI>) => {
      const payload = { ...data, neighborhood_id: neighborhoodId };
      
      if (data.id) {
        const { error } = await supabase.from('neighborhood_pois').update(payload).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('neighborhood_pois').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhood-pois-admin'] });
      setIsDialogOpen(false);
      setEditingPOI(null);
      toast.success('POI saved');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('neighborhood_pois').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhood-pois-admin'] });
      toast.success('POI deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (poi: POI) => {
    setEditingPOI(poi);
    setIsDialogOpen(true);
  };

  const handleNew = (type?: string) => {
    setEditingPOI({ ...emptyPOI, poi_type: type || 'school' });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPOI) return;
    saveMutation.mutate(editingPOI);
  };

  const updateField = (field: keyof POI, value: any) => {
    if (!editingPOI) return;
    setEditingPOI({ ...editingPOI, [field]: value });
  };

  const getTypeIcon = (type: string) => {
    const t = poiTypes.find(p => p.value === type);
    return t ? <t.icon className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  };

  return (
    <AdminLayout title={`POIs - ${neighborhood?.name || 'Loading...'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/neighborhoods">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{neighborhood?.name}</h2>
              <p className="text-sm text-muted-foreground">Manage schools, restaurants, and points of interest</p>
            </div>
          </div>
          <Button onClick={() => handleNew()}>
            <Plus className="h-4 w-4 mr-2" />
            Add POI
          </Button>
        </div>

        {/* Type Tabs */}
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {poiTypes.map(type => (
              <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-1">
                <type.icon className="h-3 w-3" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2">
          {poiTypes.map(type => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => handleNew(type.value)}
            >
              <type.icon className="h-4 w-4 mr-1" />
              Add {type.label}
            </Button>
          ))}
        </div>

        {/* POI List */}
        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : pois && pois.length > 0 ? (
            pois.map((poi) => (
              <Card key={poi.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {poi.image_url ? (
                        <img src={poi.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getTypeIcon(poi.poi_type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{poi.name}</h4>
                        <Badge variant="outline">{poi.poi_type}</Badge>
                        {poi.is_featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {poi.description || poi.address || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {poi.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {poi.rating}
                          </span>
                        )}
                        {poi.curriculum && <span>{poi.curriculum}</span>}
                        {poi.cuisine && <span>{poi.cuisine}</span>}
                        {poi.price_level && <span>{poi.price_level}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(poi)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {poi.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(poi.id)}>
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
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No POIs added yet.</p>
              <p className="text-sm">Add schools, restaurants, and other points of interest.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPOI?.id ? 'Edit POI' : 'Add POI'}
            </DialogTitle>
          </DialogHeader>

          {editingPOI && (
            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingPOI.poi_type || 'school'}
                    onValueChange={(v) => updateField('poi_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {poiTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingPOI.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Name of the place"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingPOI.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={editingPOI.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingPOI.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={editingPOI.rating || ''}
                    onChange={(e) => updateField('rating', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Count</Label>
                  <Input
                    type="number"
                    value={editingPOI.review_count || ''}
                    onChange={(e) => updateField('review_count', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Level</Label>
                  <Select
                    value={editingPOI.price_level || ''}
                    onValueChange={(v) => updateField('price_level', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {priceLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* School-specific fields */}
              {editingPOI.poi_type === 'school' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Curriculum</Label>
                      <Select
                        value={editingPOI.curriculum || ''}
                        onValueChange={(v) => updateField('curriculum', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {curriculumOptions.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Grade Levels</Label>
                      <Input
                        value={editingPOI.grade_levels || ''}
                        onChange={(e) => updateField('grade_levels', e.target.value)}
                        placeholder="e.g., KG-12"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Annual Fees From (AED)</Label>
                      <Input
                        type="number"
                        value={editingPOI.annual_fees_from || ''}
                        onChange={(e) => updateField('annual_fees_from', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Fees To (AED)</Label>
                      <Input
                        type="number"
                        value={editingPOI.annual_fees_to || ''}
                        onChange={(e) => updateField('annual_fees_to', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Restaurant-specific fields */}
              {editingPOI.poi_type === 'restaurant' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cuisine</Label>
                    <Input
                      value={editingPOI.cuisine || ''}
                      onChange={(e) => updateField('cuisine', e.target.value)}
                      placeholder="e.g., Italian, Japanese"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={editingPOI.is_delivery_available || false}
                      onCheckedChange={(v) => updateField('is_delivery_available', v)}
                    />
                    <Label>Delivery Available</Label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  value={editingPOI.website_url || ''}
                  onChange={(e) => updateField('website_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Image</Label>
                  <ImageUploader
                    currentImageUrl={editingPOI.image_url || null}
                    onUploadComplete={(url) => updateField('image_url', url)}
                    bucketName="property-media"
                    folderPath={`pois/${editingPOI.id || 'new'}`}
                    aspectRatio={4/3}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPOI.is_featured || false}
                      onCheckedChange={(v) => updateField('is_featured', v)}
                    />
                    <Label>Featured</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Index</Label>
                    <Input
                      type="number"
                      value={editingPOI.order_index || 0}
                      onChange={(e) => updateField('order_index', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
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
