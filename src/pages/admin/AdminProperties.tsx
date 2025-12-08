import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Star, MapPin } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
import { toast } from 'sonner';

const LOCATIONS = ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay', 'JVC', 'Dubai Hills', 'DIFC', 'JBR'];
const PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio'];
const STATUSES = ['available', 'sold', 'reserved'];

export default function AdminProperties() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location_area: 'Downtown Dubai',
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
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createProperty = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('properties').insert(data);
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
      const { error } = await supabase.from('properties').update(data).eq('id', id);
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
      location_area: 'Downtown Dubai',
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProperty ? 'Edit Property' : 'Create New Property'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Title</Label>
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
                  <Label>Developer</Label>
                  <Input value={formData.developer_name} onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={formData.location_area} onValueChange={(value) => setFormData({ ...formData, location_area: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (AED)</Label>
                  <Input type="number" value={formData.price_aed} onChange={(e) => setFormData({ ...formData, price_aed: Number(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Size (sqft)</Label>
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
                  <Label>Rental Yield (%)</Label>
                  <Input type="number" step="0.1" value={formData.rental_yield_estimate} onChange={(e) => setFormData({ ...formData, rental_yield_estimate: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
              <div className="flex justify-end gap-2">
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {property.is_featured && <Star className="h-4 w-4 text-gold fill-gold" />}
                      <span className="font-medium">{property.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.location_area}
                    </div>
                  </TableCell>
                  <TableCell className="text-gold font-medium">{formatPrice(property.price_aed)}</TableCell>
                  <TableCell className="capitalize">{property.property_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' :
                      property.status === 'sold' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProperty.mutate(property.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
}
