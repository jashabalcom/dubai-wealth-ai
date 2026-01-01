import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Wallet,
  AlertTriangle,
  Send,
  Mail,
  Copy
} from 'lucide-react';

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  affiliate_type: string;
  status: string;
  commission_rate: number | null;
  total_clicks: number;
  total_signups: number;
  total_qualified: number;
  total_earnings: number;
  pending_earnings: number;
  stripe_connect_id: string | null;
  stripe_connect_status: string | null;
  paypal_email: string | null;
  preferred_payout_method: string | null;
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
}

interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  product_type: string;
  billing_period: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
}

interface Payout {
  id: string;
  affiliate_id: string;
  amount: number;
  commission_count: number;
  status: string;
  payout_method: string | null;
  paypal_transaction_id: string | null;
  stripe_transfer_id: string | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export default function AdminAffiliates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [paypalTransactionId, setPaypalTransactionId] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Fetch affiliates
  const { data: affiliates, isLoading: affiliatesLoading } = useQuery({
    queryKey: ['admin-affiliates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Affiliate[];
    },
  });

  // Fetch commissions
  const { data: commissions } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Commission[];
    },
  });

  // Fetch payouts
  const { data: payouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Payout[];
    },
  });

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['affiliate-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Stats calculations
  const pendingApplications = affiliates?.filter(a => a.status === 'pending').length || 0;
  const totalAffiliates = affiliates?.filter(a => a.status === 'approved').length || 0;
  const totalPendingEarnings = affiliates?.reduce((sum, a) => sum + (a.pending_earnings || 0), 0) || 0;
  const totalPaidOut = payouts?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;

  // Affiliates ready for payout (approved status, has paypal, pending earnings >= $50)
  const affiliatesReadyForPayout = affiliates?.filter(a => 
    a.status === 'approved' && 
    a.paypal_email && 
    a.pending_earnings >= 50
  ) || [];

  // Approve/Reject mutation
  const updateAffiliateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: Record<string, unknown> = { 
        status,
        admin_notes: notes,
      };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('affiliates')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      toast({ title: 'Affiliate updated successfully' });
      setReviewDialogOpen(false);
      setSelectedAffiliate(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating affiliate', description: String(error), variant: 'destructive' });
    },
  });

  // Update commission status
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }
      if (status === 'voided') {
        updateData.voided_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('commissions')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      toast({ title: 'Commission updated' });
    },
  });

  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: async ({ affiliateId, paypalTransactionId, notes }: { 
      affiliateId: string; 
      paypalTransactionId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('record-affiliate-payout', {
        body: { 
          affiliate_id: affiliateId,
          paypal_transaction_id: paypalTransactionId,
          admin_notes: notes
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      toast({ title: 'Payout recorded successfully' });
      setPayoutDialogOpen(false);
      setSelectedAffiliate(null);
      setPaypalTransactionId('');
      setPayoutNotes('');
    },
    onError: (error) => {
      toast({ title: 'Error recording payout', description: String(error), variant: 'destructive' });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-emerald-500/10 text-emerald-500',
      suspended: 'bg-red-500/10 text-red-500',
      paid: 'bg-blue-500/10 text-blue-500',
      voided: 'bg-gray-500/10 text-gray-500',
      completed: 'bg-emerald-500/10 text-emerald-500',
      processing: 'bg-yellow-500/10 text-yellow-500',
      failed: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      member: 'bg-blue-500/10 text-blue-500',
      agent_basic: 'bg-purple-500/10 text-purple-500',
      agent_preferred: 'bg-gold/10 text-gold',
      agent_premium: 'bg-emerald-500/10 text-emerald-500',
    };
    const labels: Record<string, string> = {
      member: 'Member',
      agent_basic: 'Agent Basic',
      agent_preferred: 'Agent Preferred',
      agent_premium: 'Agent Premium',
    };
    return <Badge className={styles[type] || 'bg-muted'}>{labels[type] || type}</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <AdminLayout title="Affiliate Program">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-3xl font-bold text-yellow-500">{pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Affiliates</p>
                <p className="text-3xl font-bold text-emerald-500">{totalAffiliates}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-3xl font-bold text-gold">${totalPendingEarnings.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-gold/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
                <p className="text-3xl font-bold text-blue-500">${totalPaidOut.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="applications">Applications ({pendingApplications})</TabsTrigger>
            <TabsTrigger value="process-payouts">
              Process Payouts ({affiliatesReadyForPayout.length})
            </TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="payout-history">Payout History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Active Affiliates</CardTitle>
              <CardDescription>Manage all approved affiliates</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliatesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PayPal</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Clicks</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Signups</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pending</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates?.filter(a => a.status === 'approved').map((affiliate) => (
                        <tr key={affiliate.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{affiliate.referral_code}</td>
                          <td className="py-3 px-4">{getTypeBadge(affiliate.affiliate_type)}</td>
                          <td className="py-3 px-4">
                            {affiliate.paypal_email ? (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-emerald-500" />
                                <span className="text-sm truncate max-w-[150px]">{affiliate.paypal_email}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">{affiliate.total_clicks.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{affiliate.total_signups.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gold">${affiliate.pending_earnings.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-emerald-500">${affiliate.total_earnings.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAffiliate(affiliate);
                                setAdminNotes(affiliate.admin_notes || '');
                                setReviewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>Review and approve affiliate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affiliates?.filter(a => a.status === 'pending').map((affiliate) => (
                  <div key={affiliate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{affiliate.referral_code}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied {formatDistanceToNow(new Date(affiliate.created_at), { addSuffix: true })}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {getTypeBadge(affiliate.affiliate_type)}
                        {affiliate.paypal_email && (
                          <span className="text-xs text-muted-foreground">
                            PayPal: {affiliate.paypal_email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setAdminNotes('');
                          setReviewDialogOpen(true);
                        }}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => updateAffiliateMutation.mutate({ id: affiliate.id, status: 'approved' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
                {(!affiliates || affiliates.filter(a => a.status === 'pending').length === 0) && (
                  <p className="text-center py-8 text-muted-foreground">No pending applications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Payouts Tab */}
        <TabsContent value="process-payouts">
          <Card>
            <CardHeader>
              <CardTitle>Ready for Payout</CardTitle>
              <CardDescription>
                Affiliates with approved commissions ≥ $50 and PayPal configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliatesReadyForPayout.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No affiliates ready for payout at this time
                </p>
              ) : (
                <div className="space-y-4">
                  {affiliatesReadyForPayout.map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-mono font-medium">{affiliate.referral_code}</p>
                          {getTypeBadge(affiliate.affiliate_type)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{affiliate.paypal_email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(affiliate.paypal_email || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-gold">
                          ${affiliate.pending_earnings.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">pending</p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setPaypalTransactionId('');
                          setPayoutNotes('');
                          setPayoutDialogOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Process Payout
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Payout Workflow</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the affiliate's PayPal email</li>
                  <li>Send payment via PayPal.com</li>
                  <li>Click "Process Payout" and enter the PayPal Transaction ID</li>
                  <li>The system will mark commissions as paid and notify the affiliate</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Track and manage all commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Billing</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Gross</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions?.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-sm capitalize">{commission.product_type}</td>
                        <td className="py-3 px-4 text-sm capitalize">{commission.billing_period}</td>
                        <td className="py-3 px-4 text-right text-sm">${commission.gross_amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-sm">{(commission.commission_rate * 100).toFixed(0)}%</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gold">
                          ${commission.commission_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(commission.status)}</td>
                        <td className="py-3 px-4 text-right">
                          {commission.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCommissionMutation.mutate({ id: commission.id, status: 'approved' })}
                              >
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCommissionMutation.mutate({ id: commission.id, status: 'voided' })}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout History Tab */}
        <TabsContent value="payout-history">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Track all affiliate payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Commissions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts?.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(payout.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium">${payout.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-sm">{payout.commission_count}</td>
                        <td className="py-3 px-4 text-sm capitalize">{payout.payout_method || 'paypal'}</td>
                        <td className="py-3 px-4">{getStatusBadge(payout.status)}</td>
                        <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                          {payout.paypal_transaction_id || payout.stripe_transfer_id || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {payout.processed_at ? format(new Date(payout.processed_at), 'MMM d, yyyy') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program Settings</CardTitle>
              <CardDescription>Configure commission rates and program settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-xl">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-4">Current Configuration</h4>
                  <div className="space-y-3 text-sm">
                    {settings?.map((setting) => (
                      <div key={setting.id} className="flex justify-between">
                        <span className="text-muted-foreground">{setting.setting_key}</span>
                        <span className="font-mono">{JSON.stringify(setting.setting_value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 p-4 border rounded-lg border-yellow-500/50 bg-yellow-500/5">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500">Settings Update</p>
                    <p className="text-muted-foreground">
                      To update affiliate settings, please modify the affiliate_settings table directly.
                      Changes will apply to new commissions only.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Affiliate</DialogTitle>
            <DialogDescription>
              {selectedAffiliate?.referral_code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p>{selectedAffiliate?.affiliate_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p>{selectedAffiliate?.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Signups</p>
                <p>{selectedAffiliate?.total_signups}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Earnings</p>
                <p>${selectedAffiliate?.total_earnings?.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">PayPal Email</p>
                <p>{selectedAffiliate?.paypal_email || 'Not set'}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {selectedAffiliate?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateAffiliateMutation.mutate({ 
                    id: selectedAffiliate.id, 
                    status: 'suspended',
                    notes: adminNotes 
                  })}
                >
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateAffiliateMutation.mutate({ 
                    id: selectedAffiliate.id, 
                    status: 'approved',
                    notes: adminNotes 
                  })}
                >
                  Approve
                </Button>
              </>
            )}
            {selectedAffiliate?.status === 'approved' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateAffiliateMutation.mutate({ 
                    id: selectedAffiliate.id, 
                    status: 'suspended',
                    notes: adminNotes 
                  })}
                >
                  Suspend
                </Button>
                <Button
                  onClick={() => updateAffiliateMutation.mutate({ 
                    id: selectedAffiliate.id, 
                    status: 'approved',
                    notes: adminNotes 
                  })}
                >
                  Save Notes
                </Button>
              </>
            )}
            {selectedAffiliate?.status === 'suspended' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateAffiliateMutation.mutate({ 
                  id: selectedAffiliate.id, 
                  status: 'approved',
                  notes: adminNotes 
                })}
              >
                Reactivate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Record a PayPal payment for {selectedAffiliate?.referral_code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold text-gold">
                  ${selectedAffiliate?.pending_earnings?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">PayPal:</span>
                <span className="text-sm">{selectedAffiliate?.paypal_email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(selectedAffiliate?.paypal_email || '')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="transaction-id">PayPal Transaction ID *</Label>
              <Input
                id="transaction-id"
                value={paypalTransactionId}
                onChange={(e) => setPaypalTransactionId(e.target.value)}
                placeholder="e.g., 5TY12345AB678901C"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the transaction ID from PayPal after sending the payment
              </p>
            </div>

            <div>
              <Label htmlFor="payout-notes">Notes (optional)</Label>
              <Textarea
                id="payout-notes"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="Any notes about this payout..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAffiliate && paypalTransactionId) {
                  processPayoutMutation.mutate({
                    affiliateId: selectedAffiliate.id,
                    paypalTransactionId,
                    notes: payoutNotes
                  });
                }
              }}
              disabled={!paypalTransactionId || processPayoutMutation.isPending}
            >
              {processPayoutMutation.isPending ? 'Processing...' : 'Confirm Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
