import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, TrendingUp, DollarSign, MousePointer, Users, Target, Facebook, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Campaign {
  id: string;
  platform: string;
  campaign_id: string | null;
  campaign_name: string;
  ad_spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_attributed: number;
  date: string;
  notes: string | null;
}

const PLATFORM_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  google: Globe,
  tiktok: Globe,
  linkedin: Globe,
  other: Globe,
};

export default function AdminMarketing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'facebook',
    campaign_name: '',
    campaign_id: '',
    ad_spend: '',
    impressions: '',
    clicks: '',
    conversions: '',
    revenue_attributed: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const addCampaign = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('marketing_campaigns').insert({
        platform: data.platform,
        campaign_name: data.campaign_name,
        campaign_id: data.campaign_id || null,
        ad_spend: parseFloat(data.ad_spend) || 0,
        impressions: parseInt(data.impressions) || 0,
        clicks: parseInt(data.clicks) || 0,
        conversions: parseInt(data.conversions) || 0,
        revenue_attributed: parseFloat(data.revenue_attributed) || 0,
        date: data.date,
        notes: data.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsDialogOpen(false);
      setFormData({
        platform: 'facebook',
        campaign_name: '',
        campaign_id: '',
        ad_spend: '',
        impressions: '',
        clicks: '',
        conversions: '',
        revenue_attributed: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      toast.success('Campaign data added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add campaign: ' + error.message);
    },
  });

  // Calculate aggregate metrics
  const totalSpend = campaigns?.reduce((sum, c) => sum + Number(c.ad_spend), 0) || 0;
  const totalRevenue = campaigns?.reduce((sum, c) => sum + Number(c.revenue_attributed), 0) || 0;
  const totalConversions = campaigns?.reduce((sum, c) => sum + c.conversions, 0) || 0;
  const totalClicks = campaigns?.reduce((sum, c) => sum + c.clicks, 0) || 0;
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const overallCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const overallCPL = totalConversions > 0 ? totalSpend / totalConversions : 0;

  // Platform breakdown for chart
  const platformData = campaigns?.reduce((acc, c) => {
    const existing = acc.find(p => p.platform === c.platform);
    if (existing) {
      existing.spend += Number(c.ad_spend);
      existing.revenue += Number(c.revenue_attributed);
    } else {
      acc.push({ platform: c.platform, spend: Number(c.ad_spend), revenue: Number(c.revenue_attributed) });
    }
    return acc;
  }, [] as { platform: string; spend: number; revenue: number }[]) || [];

  const stats = [
    { label: 'Total Ad Spend', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-red-500' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Overall ROAS', value: `${overallROAS.toFixed(2)}x`, icon: Target, color: 'text-gold' },
    { label: 'Cost Per Lead', value: `$${overallCPL.toFixed(2)}`, icon: Users, color: 'text-blue-500' },
  ];

  return (
    <AdminLayout title="Marketing & Ads">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Spend vs Revenue by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="platform" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Bar dataKey="spend" name="Ad Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">ROAS by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformData.map(p => ({ ...p, roas: p.spend > 0 ? (p.revenue / p.spend).toFixed(2) : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="platform" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Bar dataKey="roas" name="ROAS" fill="#CBB89E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Campaign Performance</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Campaign Data</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addCampaign.mutate(formData); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform</Label>
                    <Select value={formData.platform} onValueChange={(v) => setFormData(f => ({ ...f, platform: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label>Campaign Name</Label>
                  <Input value={formData.campaign_name} onChange={(e) => setFormData(f => ({ ...f, campaign_name: e.target.value }))} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ad Spend ($)</Label>
                    <Input type="number" step="0.01" value={formData.ad_spend} onChange={(e) => setFormData(f => ({ ...f, ad_spend: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Revenue Attributed ($)</Label>
                    <Input type="number" step="0.01" value={formData.revenue_attributed} onChange={(e) => setFormData(f => ({ ...f, revenue_attributed: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Impressions</Label>
                    <Input type="number" value={formData.impressions} onChange={(e) => setFormData(f => ({ ...f, impressions: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Clicks</Label>
                    <Input type="number" value={formData.clicks} onChange={(e) => setFormData(f => ({ ...f, clicks: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Conversions</Label>
                    <Input type="number" value={formData.conversions} onChange={(e) => setFormData(f => ({ ...f, conversions: e.target.value }))} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={addCampaign.isPending}>
                  {addCampaign.isPending ? 'Adding...' : 'Add Campaign Data'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const roas = Number(campaign.ad_spend) > 0 ? Number(campaign.revenue_attributed) / Number(campaign.ad_spend) : 0;
                  const Icon = PLATFORM_ICONS[campaign.platform] || Globe;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{campaign.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                      <TableCell>{format(new Date(campaign.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">${Number(campaign.ad_spend).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-emerald-500">${Number(campaign.revenue_attributed).toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${roas >= 1 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {roas.toFixed(2)}x
                      </TableCell>
                      <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.conversions}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No campaign data yet. Add your first campaign above.</p>
          </div>
        )}
      </div>

      {/* Future Integration Notice */}
      <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6">
        <h4 className="font-semibold mb-2">Coming Soon: Automated Ad Platform Sync</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Facebook Ads and Google Ads accounts for automatic campaign data syncing. 
          For now, enter your campaign data manually above.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" disabled>
            <Facebook className="h-4 w-4 mr-2" />
            Connect Facebook Ads
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Globe className="h-4 w-4 mr-2" />
            Connect Google Ads
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
