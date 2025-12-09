import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, BadgeCheck, Phone, Mail, Building2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const LANGUAGES = ['English', 'Arabic', 'Hindi', 'Urdu', 'Russian', 'Chinese', 'French', 'Spanish'];
const SPECIALIZATIONS = ['Residential', 'Commercial', 'Off-Plan', 'Luxury', 'Investment', 'Rentals'];

interface Agent {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  rera_brn: string | null;
  languages: string[];
  specializations: string[];
  areas_covered: string[];
  bio: string | null;
  avatar_url: string | null;
  years_experience: number;
  is_verified: boolean;
  is_active: boolean;
  brokerage_id: string | null;
  brokerage?: { name: string } | null;
}

interface Brokerage {
  id: string;
  name: string;
}

export default function AdminAgents() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    rera_brn: '',
    languages: [] as string[],
    specializations: [] as string[],
    areas_covered: [] as string[],
    bio: '',
    years_experience: 0,
    is_verified: false,
    is_active: true,
    brokerage_id: '',
  });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*, brokerage:brokerages(name)')
        .order('created_at', { ascending: false });
      
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
        .select('name')
        .order('name');
      
      if (error) throw error;
      return data.map(c => c.name);
    },
  });

  const createAgent = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        brokerage_id: data.brokerage_id || null,
      };
      const { error } = await supabase.from('agents').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      toast.success('Agent created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create agent: ' + error.message);
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, ...data }: typeof formData & { id: string }) => {
      const updateData = {
        ...data,
        brokerage_id: data.brokerage_id || null,
      };
      const { error } = await supabase.from('agents').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      toast.success('Agent updated');
      resetForm();
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      toast.success('Agent deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      rera_brn: '',
      languages: [],
      specializations: [],
      areas_covered: [],
      bio: '',
      years_experience: 0,
      is_verified: false,
      is_active: true,
      brokerage_id: '',
    });
    setEditingAgent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      full_name: agent.full_name,
      email: agent.email || '',
      phone: agent.phone || '',
      whatsapp: agent.whatsapp || '',
      rera_brn: agent.rera_brn || '',
      languages: agent.languages || [],
      specializations: agent.specializations || [],
      areas_covered: agent.areas_covered || [],
      bio: agent.bio || '',
      years_experience: agent.years_experience || 0,
      is_verified: agent.is_verified,
      is_active: agent.is_active,
      brokerage_id: agent.brokerage_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      updateAgent.mutate({ id: editingAgent.id, ...formData });
    } else {
      createAgent.mutate(formData);
    }
  };

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  return (
    <AdminLayout title="Agents Manager">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage real estate agents</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-background" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
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
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+971..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>RERA BRN</Label>
                  <Input
                    value={formData.rera_brn}
                    onChange={(e) => setFormData({ ...formData, rera_brn: e.target.value })}
                    placeholder="Broker Registration Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brokerage</Label>
                  <Select value={formData.brokerage_id} onValueChange={(value) => setFormData({ ...formData, brokerage_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select brokerage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {brokerages.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <Badge
                        key={lang}
                        variant={formData.languages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFormData({ ...formData, languages: toggleArrayItem(formData.languages, lang) })}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <Badge
                        key={spec}
                        variant={formData.specializations.includes(spec) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFormData({ ...formData, specializations: toggleArrayItem(formData.specializations, spec) })}
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Areas Covered</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {communities.map((area) => (
                      <Badge
                        key={area}
                        variant={formData.areas_covered.includes(area) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => setFormData({ ...formData, areas_covered: toggleArrayItem(formData.areas_covered, area) })}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                  {editingAgent ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No agents yet. Add your first agent.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Brokerage</TableHead>
                <TableHead>RERA BRN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {agent.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                      <div>
                        <span className="font-medium">{agent.full_name}</span>
                        {agent.years_experience > 0 && (
                          <p className="text-xs text-muted-foreground">{agent.years_experience} years exp.</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {agent.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {agent.email}
                        </div>
                      )}
                      {agent.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {agent.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.brokerage ? (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{agent.brokerage.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Independent</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{agent.rera_brn || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      agent.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(agent)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAgent.mutate(agent.id)} className="text-destructive">
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
