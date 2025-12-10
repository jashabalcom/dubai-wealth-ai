import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Star, MapPin, User, Building2, Image as ImageIcon, FileImage } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageGalleryManager } from '@/components/admin/ImageGalleryManager';
import { FloorPlansManager } from '@/components/admin/FloorPlansManager';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio'];
const STATUSES = ['available', 'sold', 'reserved'];
const LISTING_TYPES = ['sale', 'rent'];
const FURNISHING_OPTIONS = ['unfurnished', 'furnished', 'semi-furnished'];
const VIEW_TYPES = ['sea', 'city', 'garden', 'pool', 'landmark', 'canal', 'golf', 'community'];
const RENTAL_FREQUENCIES = ['yearly', 'monthly', 'weekly', 'daily'];

interface Agent {
  id: string;
  full_name: string;
  brokerage?: { name: string } | null;
}

interface Brokerage {
  id: string;
  name: string;
}

interface Community {
  id: string;
  name: string;
}

interface Developer {
  id: string;
  name: string;
}

export default function AdminProperties() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [galleryPropertyId, setGalleryPropertyId] = useState<string | null>(null);
  const [floorPlansPropertyId, setFloorPlansPropertyId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location_area: '',
    property_type: 'apartment',
    price_aed: 0,
    size_sqft: 0,
    bedrooms: 1,
    bathrooms: 1,
    developer_name: '',
    rental_yield_estimate: 0,
    is_featured: false,
    is_off_plan: false,
    status: 'available',
    // New fields
    listing_type: 'sale',
    agent_id: '',
    brokerage_id: '',
    community_id: '',
    developer_id: '',
    rera_permit_number: '',
    rera_permit_expiry: '',
    service_charge_per_sqft: 0,
    furnishing: 'unfurnished',
    view_type: '',
    floor_number: 0,
    total_floors: 0,
    year_built: 0,
    parking_spaces: 0,
    virtual_tour_url: '',
    video_url: '',
    rental_frequency: 'yearly',
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:agents(id, full_name),
          brokerage:brokerages(id, name),
          community:communities(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, full_name, brokerage:brokerages(name)')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data as Agent[];
    },
  });

  const { data: brokerages = [] } = useQuery({
    queryKey: ['brokerages-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brokerages')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Brokerage[];
    },
  });

  const { data: communities = [] } = useQuery({
    queryKey: ['communities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Community[];
    },
  });

  const { data: developers = [] } = useQuery({
    queryKey: ['developers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Developer[];
    },
  });

  const createProperty = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        agent_id: data.agent_id || null,
        brokerage_id: data.brokerage_id || null,
        community_id: data.community_id || null,
        developer_id: data.developer_id || null,
        rera_permit_expiry: data.rera_permit_expiry || null,
        view_type: data.view_type || null,
        service_charge_per_sqft: data.service_charge_per_sqft || null,
        floor_number: data.floor_number || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
      };
      const { error } = await supabase.from('properties').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Property created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create property: ' + error.message);
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...data }: typeof formData & { id: string }) => {
      const updateData = {
        ...data,
        agent_id: data.agent_id || null,
        brokerage_id: data.brokerage_id || null,
        community_id: data.community_id || null,
        developer_id: data.developer_id || null,
        rera_permit_expiry: data.rera_permit_expiry || null,
        view_type: data.view_type || null,
        service_charge_per_sqft: data.service_charge_per_sqft || null,
        floor_number: data.floor_number || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
      };
      const { error } = await supabase.from('properties').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Property updated');
      resetForm();
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Property deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      location_area: '',
      property_type: 'apartment',
      price_aed: 0,
      size_sqft: 0,
      bedrooms: 1,
      bathrooms: 1,
      developer_name: '',
      rental_yield_estimate: 0,
      is_featured: false,
      is_off_plan: false,
      status: 'available',
      listing_type: 'sale',
      agent_id: '',
      brokerage_id: '',
      community_id: '',
      developer_id: '',
      rera_permit_number: '',
      rera_permit_expiry: '',
      service_charge_per_sqft: 0,
      furnishing: 'unfurnished',
      view_type: '',
      floor_number: 0,
      total_floors: 0,
      year_built: 0,
      parking_spaces: 0,
      virtual_tour_url: '',
      video_url: '',
      rental_frequency: 'yearly',
    });
    setEditingProperty(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      slug: property.slug,
      description: property.description || '',
      location_area: property.location_area,
      property_type: property.property_type,
      price_aed: property.price_aed,
      size_sqft: property.size_sqft,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      developer_name: property.developer_name || '',
      rental_yield_estimate: property.rental_yield_estimate || 0,
      is_featured: property.is_featured,
      is_off_plan: property.is_off_plan,
      status: property.status,
      listing_type: property.listing_type || 'sale',
      agent_id: property.agent_id || '',
      brokerage_id: property.brokerage_id || '',
      community_id: property.community_id || '',
      developer_id: property.developer_id || '',
      rera_permit_number: property.rera_permit_number || '',
      rera_permit_expiry: property.rera_permit_expiry || '',
      service_charge_per_sqft: property.service_charge_per_sqft || 0,
      furnishing: property.furnishing || 'unfurnished',
      view_type: property.view_type || '',
      floor_number: property.floor_number || 0,
      total_floors: property.total_floors || 0,
      year_built: property.year_built || 0,
      parking_spaces: property.parking_spaces || 0,
      virtual_tour_url: property.virtual_tour_url || '',
      video_url: property.video_url || '',
      rental_frequency: property.rental_frequency || 'yearly',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      updateProperty.mutate({ id: editingProperty.id, ...formData });
    } else {
      createProperty.mutate(formData);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <AdminLayout title="Properties Manager">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage property listings</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-background" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProperty ? 'Edit Property' : 'Create New Property'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="agent">Agent & RERA</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Listing Type</Label>
                      <Select value={formData.listing_type} onValueChange={(value) => setFormData({ ...formData, listing_type: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LISTING_TYPES.map((type) => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Community</Label>
                      <Select value={formData.community_id || "none"} onValueChange={(value) => setFormData({ ...formData, community_id: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {communities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location Area</Label>
                      <Input value={formData.location_area} onChange={(e) => setFormData({ ...formData, location_area: e.target.value })} placeholder="e.g. Dubai Marina" />
                    </div>
                    <div className="space-y-2">
                      <Label>Property Type</Label>
                      <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price (AED) *</Label>
                      <Input type="number" value={formData.price_aed} onChange={(e) => setFormData({ ...formData, price_aed: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Size (sqft) *</Label>
                      <Input type="number" value={formData.size_sqft} onChange={(e) => setFormData({ ...formData, size_sqft: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                    <div className="col-span-2 flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                        <Label>Featured</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.is_off_plan} onCheckedChange={(checked) => setFormData({ ...formData, is_off_plan: checked })} />
                        <Label>Off-Plan</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Furnishing</Label>
                      <Select value={formData.furnishing} onValueChange={(value) => setFormData({ ...formData, furnishing: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FURNISHING_OPTIONS.map((f) => <SelectItem key={f} value={f} className="capitalize">{f.replace('-', ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>View Type</Label>
                      <Select value={formData.view_type || "none"} onValueChange={(value) => setFormData({ ...formData, view_type: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select view" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {VIEW_TYPES.map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Floor Number</Label>
                      <Input type="number" value={formData.floor_number} onChange={(e) => setFormData({ ...formData, floor_number: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Floors</Label>
                      <Input type="number" value={formData.total_floors} onChange={(e) => setFormData({ ...formData, total_floors: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Year Built</Label>
                      <Input type="number" value={formData.year_built} onChange={(e) => setFormData({ ...formData, year_built: Number(e.target.value) })} placeholder="e.g. 2020" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parking Spaces</Label>
                      <Input type="number" value={formData.parking_spaces} onChange={(e) => setFormData({ ...formData, parking_spaces: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Service Charge (AED/sqft)</Label>
                      <Input type="number" step="0.01" value={formData.service_charge_per_sqft} onChange={(e) => setFormData({ ...formData, service_charge_per_sqft: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rental Yield (%)</Label>
                      <Input type="number" step="0.1" value={formData.rental_yield_estimate} onChange={(e) => setFormData({ ...formData, rental_yield_estimate: Number(e.target.value) })} />
                    </div>
                    {formData.listing_type === 'rent' && (
                      <div className="space-y-2">
                        <Label>Rental Frequency</Label>
                        <Select value={formData.rental_frequency} onValueChange={(value) => setFormData({ ...formData, rental_frequency: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RENTAL_FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Developer</Label>
                      <Select value={formData.developer_id || "none"} onValueChange={(value) => setFormData({ ...formData, developer_id: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select developer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {developers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Developer Name (legacy)</Label>
                      <Input value={formData.developer_name} onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })} placeholder="Text field for older data" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="agent" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Listing Agent</Label>
                      <Select value={formData.agent_id || "none"} onValueChange={(value) => setFormData({ ...formData, agent_id: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.full_name} {a.brokerage ? `(${a.brokerage.name})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Brokerage</Label>
                      <Select value={formData.brokerage_id || "none"} onValueChange={(value) => setFormData({ ...formData, brokerage_id: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select brokerage" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {brokerages.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 border-t border-border pt-4 mt-2">
                      <h4 className="font-medium mb-3">RERA Permit Details</h4>
                    </div>
                    <div className="space-y-2">
                      <Label>RERA Permit Number</Label>
                      <Input 
                        value={formData.rera_permit_number} 
                        onChange={(e) => setFormData({ ...formData, rera_permit_number: e.target.value })} 
                        placeholder="e.g. 12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RERA Permit Expiry</Label>
                      <Input 
                        type="date" 
                        value={formData.rera_permit_expiry} 
                        onChange={(e) => setFormData({ ...formData, rera_permit_expiry: e.target.value })} 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Virtual Tour URL</Label>
                      <Input 
                        type="url" 
                        value={formData.virtual_tour_url} 
                        onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })} 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input 
                        type="url" 
                        value={formData.video_url} 
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} 
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    {editingProperty ? (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setGalleryPropertyId(editingProperty.id)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Manage Image Gallery
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setFloorPlansPropertyId(editingProperty.id)}
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Manage Floor Plans
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground">
                        <p className="text-sm">Save the property first to add images and floor plans</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-gold hover:bg-gold/90 text-background">
                  {editingProperty ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading properties...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: any) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {property.is_featured && <Star className="h-4 w-4 text-gold fill-gold" />}
                      <div>
                        <span className="font-medium">{property.title}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{property.listing_type || 'sale'}</span>
                          {property.rera_permit_number && (
                            <span className="text-emerald-500">RERA #{property.rera_permit_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{property.community?.name || property.location_area}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gold font-medium">{formatPrice(property.price_aed)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="capitalize">{property.property_type}</span>
                      {property.furnishing && property.furnishing !== 'unfurnished' && (
                        <span className="text-xs text-muted-foreground block capitalize">{property.furnishing}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.agent ? (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{property.agent.full_name}</span>
                      </div>
                    ) : property.brokerage ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span>{property.brokerage.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' :
                      property.status === 'sold' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setGalleryPropertyId(property.id)} title="Manage Images">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setFloorPlansPropertyId(property.id)} title="Manage Floor Plans">
                        <FileImage className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(property)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete "{property.title}" including all associated images and floor plans.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteProperty.mutate(property.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Image Gallery Manager Modal */}
      <ImageGalleryManager
        propertyId={galleryPropertyId || ''}
        open={!!galleryPropertyId}
        onOpenChange={(open) => !open && setGalleryPropertyId(null)}
      />

      {/* Floor Plans Manager Modal */}
      <FloorPlansManager
        propertyId={floorPlansPropertyId || ''}
        open={!!floorPlansPropertyId}
        onOpenChange={(open) => !open && setFloorPlansPropertyId(null)}
      />
    </AdminLayout>
  );
}
