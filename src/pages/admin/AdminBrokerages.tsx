import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, BadgeCheck, Globe, Phone, Mail, Users } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Brokerage {
  id: string;
  name: string;
  rera_orn: string | null;
  logo_url: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string;
  total_agents: number;
  total_listings: number;
  is_verified: boolean;
  is_active: boolean;
}

export default function AdminBrokerages() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrokerage, setEditingBrokerage] = useState<Brokerage | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    rera_orn: '',
    logo_url: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: 'Dubai',
    is_verified: false,
    is_active: true,
  });

  const { data: brokerages = [], isLoading } = useQuery({
    queryKey: ['admin-brokerages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brokerages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Brokerage[];
    },
  });

  const createBrokerage = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('brokerages').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokerages'] });
      toast.success('Brokerage created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create brokerage: ' + error.message);
    },
  });

  const updateBrokerage = useMutation({
    mutationFn: async ({ id, ...data }: typeof formData & { id: string }) => {
      const { error } = await supabase.from('brokerages').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokerages'] });
      toast.success('Brokerage updated');
      resetForm();
    },
  });

  const deleteBrokerage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brokerages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokerages'] });
      toast.success('Brokerage deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rera_orn: '',
      logo_url: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: 'Dubai',
      is_verified: false,
      is_active: true,
    });
    setEditingBrokerage(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (brokerage: Brokerage) => {
    setEditingBrokerage(brokerage);
    setFormData({
      name: brokerage.name,
      rera_orn: brokerage.rera_orn || '',
      logo_url: brokerage.logo_url || '',
      description: brokerage.description || '',
      email: brokerage.email || '',
      phone: brokerage.phone || '',
      website: brokerage.website || '',
      address: brokerage.address || '',
      city: brokerage.city || 'Dubai',
      is_verified: brokerage.is_verified,
      is_active: brokerage.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrokerage) {
      updateBrokerage.mutate({ id: editingBrokerage.id, ...formData });
    } else {
      createBrokerage.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Brokerages Manager">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage real estate brokerages</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-background" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brokerage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBrokerage ? 'Edit Brokerage' : 'Create New Brokerage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>RERA ORN</Label>
                  <Input
                    value={formData.rera_orn}
                    onChange={(e) => setFormData({ ...formData, rera_orn: e.target.value })}
                    placeholder="Office Registration Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971..."
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_verified}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                    />
                    <Label>Verified</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-gold hover:bg-gold/90 text-background">
                  {editingBrokerage ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading brokerages...</div>
        ) : brokerages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No brokerages yet. Add your first brokerage.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brokerage</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>RERA ORN</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokerages.map((brokerage) => (
                <TableRow key={brokerage.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {brokerage.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                      <div>
                        <span className="font-medium">{brokerage.name}</span>
                        <p className="text-xs text-muted-foreground">{brokerage.city}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {brokerage.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {brokerage.email}
                        </div>
                      )}
                      {brokerage.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {brokerage.phone}
                        </div>
                      )}
                      {brokerage.website && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a href={brokerage.website} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{brokerage.rera_orn || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {brokerage.total_agents}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      brokerage.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {brokerage.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(brokerage)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteBrokerage.mutate(brokerage.id)} className="text-destructive">
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
