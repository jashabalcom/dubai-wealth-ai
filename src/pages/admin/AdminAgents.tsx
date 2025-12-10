import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, BadgeCheck, Phone, Mail, Building2, CreditCard, Crown, Star, RefreshCw, Settings } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AvatarUploader } from '@/components/admin/AvatarUploader';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAgentSubscription } from '@/hooks/useAgentSubscription';
import { AGENT_TIERS, AgentTier } from '@/lib/agent-tiers-config';

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
  subscription_tier: AgentTier | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  max_listings: number | null;
  featured_listings_remaining: number | null;
  show_direct_contact: boolean | null;
  priority_ranking: number | null;
  stripe_customer_id: string | null;
}

interface Brokerage {
  id: string;
  name: string;
}

function TierBadge({ tier }: { tier: AgentTier | null }) {
  if (!tier || tier === 'basic') {
    return <Badge variant="outline" className="text-xs">Basic</Badge>;
  }
  if (tier === 'preferred') {
    return (
      <Badge className="bg-blue-500 text-white text-xs">
        <Star className="h-3 w-3 mr-1" />
        Preferred
      </Badge>
    );
  }
  if (tier === 'premium') {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs">
        <Crown className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    );
  }
  return null;
}

export default function AdminAgents() {
  const [searchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [selectedAgentForTier, setSelectedAgentForTier] = useState<Agent | null>(null);
  const queryClient = useQueryClient();
  const { loading: subscriptionLoading, startAgentCheckout, openAgentPortal, updateAgentTierManually, checkAgentSubscription } = useAgentSubscription();

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
    avatar_url: '',
    years_experience: 0,
    is_verified: false,
    is_active: true,
    brokerage_id: '',
  });

  // Handle subscription success callback
  useEffect(() => {
    const success = searchParams.get('subscription_success');
    const agentId = searchParams.get('agent_id');
    
    if (success === 'true' && agentId) {
      // Refresh subscription status
      checkAgentSubscription(agentId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
        toast.success('Agent subscription activated!');
      });
    }
  }, [searchParams, checkAgentSubscription, queryClient]);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['admin-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*, brokerage:brokerages(name)')
        .order('priority_ranking', { ascending: false })
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

  // Get listing counts per agent
  const { data: listingCounts = {} } = useQuery({
    queryKey: ['agent-listing-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('agent_id')
        .not('agent_id', 'is', null);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        if (p.agent_id) {
          counts[p.agent_id] = (counts[p.agent_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const createAgent = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        brokerage_id: data.brokerage_id || null,
        avatar_url: data.avatar_url || null,
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
        avatar_url: data.avatar_url || null,
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
      avatar_url: '',
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
      avatar_url: agent.avatar_url || '',
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

  const handleManageTier = (agent: Agent) => {
    setSelectedAgentForTier(agent);
    setTierDialogOpen(true);
  };

  const handleSetTierManually = async (tier: AgentTier) => {
    if (!selectedAgentForTier) return;
    const success = await updateAgentTierManually(selectedAgentForTier.id, tier);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      setTierDialogOpen(false);
      setSelectedAgentForTier(null);
    }
  };

  const handleRefreshSubscription = async (agentId: string) => {
    await checkAgentSubscription(agentId);
    queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
  };

  const getListingStatus = (agent: Agent) => {
    const currentCount = listingCounts[agent.id] || 0;
    const limit = agent.max_listings ?? 3;
    
    if (limit === -1) {
      return { text: `${currentCount} listings`, color: 'text-muted-foreground' };
    }
    
    const percentage = (currentCount / limit) * 100;
    if (percentage >= 100) {
      return { text: `${currentCount}/${limit} (at limit)`, color: 'text-destructive' };
    }
    if (percentage >= 80) {
      return { text: `${currentCount}/${limit}`, color: 'text-amber-500' };
    }
    return { text: `${currentCount}/${limit}`, color: 'text-muted-foreground' };
  };

  return (
    <AdminLayout title="Agents Manager">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage real estate agents and subscriptions</p>
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
              {/* Avatar Upload Section */}
              <div className="flex justify-center pb-4 border-b border-border">
                <AvatarUploader
                  currentAvatarUrl={formData.avatar_url}
                  onUpload={(url) => setFormData({ ...formData, avatar_url: url })}
                  folder="agents"
                />
              </div>

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
                  <Select 
                    value={formData.brokerage_id || "none"} 
                    onValueChange={(value) => setFormData({ ...formData, brokerage_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select brokerage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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

      {/* Tier Management Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription - {selectedAgentForTier?.full_name}</DialogTitle>
          </DialogHeader>
          {selectedAgentForTier && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Tier:</span>
                  <TierBadge tier={selectedAgentForTier.subscription_tier} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm">{selectedAgentForTier.subscription_status || 'inactive'}</span>
                </div>
                {selectedAgentForTier.subscription_expires_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Renews:</span>
                    <span className="text-sm">{new Date(selectedAgentForTier.subscription_expires_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Listings:</span>
                  <span className={`text-sm ${getListingStatus(selectedAgentForTier).color}`}>
                    {getListingStatus(selectedAgentForTier).text}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Subscription Actions</h4>
                
                {/* Start/Upgrade Subscription */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => startAgentCheckout(selectedAgentForTier.id, 'preferred')}
                    disabled={subscriptionLoading || !selectedAgentForTier.email}
                    className="justify-start"
                  >
                    <Star className="h-4 w-4 mr-2 text-blue-500" />
                    Preferred ($99/mo)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => startAgentCheckout(selectedAgentForTier.id, 'premium')}
                    disabled={subscriptionLoading || !selectedAgentForTier.email}
                    className="justify-start"
                  >
                    <Crown className="h-4 w-4 mr-2 text-amber-500" />
                    Premium ($299/mo)
                  </Button>
                </div>

                {!selectedAgentForTier.email && (
                  <p className="text-xs text-destructive">Agent must have an email address for billing</p>
                )}

                {selectedAgentForTier.stripe_customer_id && (
                  <Button
                    variant="outline"
                    onClick={() => openAgentPortal(selectedAgentForTier.id)}
                    disabled={subscriptionLoading}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing (Stripe Portal)
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleRefreshSubscription(selectedAgentForTier.id)}
                  disabled={subscriptionLoading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                  Refresh Subscription Status
                </Button>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Manual Override</h4>
                <p className="text-xs text-muted-foreground">Set tier manually (bypasses Stripe billing)</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetTierManually('basic')}
                    disabled={subscriptionLoading}
                  >
                    Basic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetTierManually('preferred')}
                    disabled={subscriptionLoading}
                  >
                    Preferred
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetTierManually('premium')}
                    disabled={subscriptionLoading}
                  >
                    Premium
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <TableHead>Tier</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Brokerage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => {
                const listingStatus = getListingStatus(agent);
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          {agent.avatar_url ? (
                            <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                              {agent.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            {agent.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                            <span className="font-medium">{agent.full_name}</span>
                          </div>
                          {agent.years_experience > 0 && (
                            <p className="text-xs text-muted-foreground">{agent.years_experience} years exp.</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={agent.subscription_tier} />
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${listingStatus.color}`}>
                        {listingStatus.text}
                      </span>
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
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(agent)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageTier(agent)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Agent
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete "{agent.full_name}" and may affect associated property listings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteAgent.mutate(agent.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
}
