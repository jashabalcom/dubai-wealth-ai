import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  useMortgageLeads, 
  useMortgageLeadStats, 
  useUpdateMortgageLead,
  useMortgagePartners,
  MortgageLead 
} from '@/hooks/useMortgageLeads';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Phone,
  Mail,
  Calendar,
  Building2,
  User,
  Briefcase,
  Clock,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'sent_to_partner', label: 'Sent to Partner' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  sent_to_partner: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  converted: 'bg-gold/10 text-gold border-gold/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function AdminMortgageLeads() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<MortgageLead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: leads, isLoading } = useMortgageLeads({ status: statusFilter });
  const { data: stats } = useMortgageLeadStats();
  const { data: partners } = useMortgagePartners();
  const updateLead = useUpdateMortgageLead();

  const filteredLeads = leads?.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.full_name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.includes(query)
    );
  });

  const formatAED = (amount: number) => 
    `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({ 
        id: leadId, 
        updates: { 
          status: newStatus,
          ...(newStatus === 'converted' ? { converted_at: new Date().toISOString() } : {})
        } 
      });
      toast.success('Lead status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async (leadId: string, notes: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, updates: { admin_notes: notes } });
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const handleRevenueUpdate = async (leadId: string, revenue: number) => {
    try {
      await updateLead.mutateAsync({ id: leadId, updates: { revenue_earned: revenue } });
      toast.success('Revenue updated');
    } catch (error) {
      toast.error('Failed to update revenue');
    }
  };

  const exportLeads = () => {
    if (!filteredLeads) return;
    
    const csv = [
      ['Name', 'Email', 'Phone', 'Loan Amount', 'Monthly Payment', 'Status', 'Lead Score', 'Created'].join(','),
      ...filteredLeads.map(lead => [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.loan_amount,
        lead.monthly_payment,
        lead.status,
        lead.lead_score,
        format(new Date(lead.created_at), 'yyyy-MM-dd'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <AdminLayout title="Mortgage Leads">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Target className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats?.avgLeadScore || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatAED(stats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={exportLeads}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading leads...</div>
          ) : filteredLeads?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-medium text-sm">Lead</th>
                    <th className="text-left p-4 font-medium text-sm">Loan Details</th>
                    <th className="text-left p-4 font-medium text-sm">Score</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Created</th>
                    <th className="text-right p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads?.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{lead.full_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{formatAED(lead.loan_amount)}</p>
                          <p className="text-sm text-muted-foreground">{formatAED(lead.monthly_payment)}/mo</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className={`w-4 h-4 ${getLeadScoreColor(lead.lead_score)}`} />
                          <span className={`font-medium ${getLeadScoreColor(lead.lead_score)}`}>
                            {lead.lead_score}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          value={lead.status}
                          onValueChange={(v) => handleStatusChange(lead.id, v)}
                        >
                          <SelectTrigger className={`w-[140px] ${STATUS_COLORS[lead.status] || ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    Contact
                  </div>
                  <p className="font-medium">{selectedLead.full_name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    <a href={`mailto:${selectedLead.email}`} className="text-gold hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${selectedLead.phone}`} className="text-gold hover:underline">
                      {selectedLead.phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    Loan Request
                  </div>
                  <p className="font-medium">{formatAED(selectedLead.loan_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    Property: {formatAED(selectedLead.property_price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Down: {selectedLead.down_payment_percent}% ({formatAED(selectedLead.down_payment_amount)})
                  </p>
                </div>
              </div>

              {/* Qualification */}
              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Qualification
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employment:</span>
                    <p className="font-medium capitalize">{selectedLead.employment_status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Income Range:</span>
                    <p className="font-medium">{selectedLead.monthly_income_range.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline:</span>
                    <p className="font-medium capitalize">{selectedLead.purchase_timeline.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lead Score:</span>
                    <p className={`font-medium ${getLeadScoreColor(selectedLead.lead_score)}`}>
                      {selectedLead.lead_score}/100
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge variant={selectedLead.uae_resident ? 'default' : 'secondary'}>
                    {selectedLead.uae_resident ? 'UAE Resident' : 'Non-Resident'}
                  </Badge>
                  {selectedLead.first_time_buyer && <Badge variant="outline">First-Time Buyer</Badge>}
                  {selectedLead.existing_mortgage && <Badge variant="destructive">Has Mortgage</Badge>}
                </div>
              </div>

              {/* Revenue Tracking */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue Earned (AED)
                </label>
                <Input
                  type="number"
                  defaultValue={selectedLead.revenue_earned}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (value !== selectedLead.revenue_earned) {
                      handleRevenueUpdate(selectedLead.id, value);
                    }
                  }}
                  placeholder="0"
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  defaultValue={selectedLead.admin_notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (selectedLead.admin_notes || '')) {
                      handleNotesUpdate(selectedLead.id, e.target.value);
                    }
                  }}
                  placeholder="Add notes about this lead..."
                  rows={3}
                />
              </div>

              {/* Timestamps */}
              <div className="flex gap-6 text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created: {format(new Date(selectedLead.created_at), 'MMM d, yyyy h:mm a')}
                </div>
                {selectedLead.converted_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Converted: {format(new Date(selectedLead.converted_at), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
