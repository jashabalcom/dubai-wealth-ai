import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone,
  Mail,
  Calendar,
  Building2,
  User,
  MessageSquare,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface PropertyInquiry {
  id: string;
  property_id: string;
  agent_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  inquiry_type: string;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    location_area: string;
    price_aed: number;
    slug: string;
    bayut_agent_data: any;
    bayut_agency_data: any;
    developer_name: string | null;
  };
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  converted: 'bg-gold/10 text-gold border-gold/20',
  closed: 'bg-muted text-muted-foreground border-muted',
};

export default function AdminInquiries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<PropertyInquiry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['admin-inquiries', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('property_inquiries')
        .select(`
          *,
          property:properties(
            id, title, location_area, price_aed, slug,
            bayut_agent_data, bayut_agency_data, developer_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyInquiry[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PropertyInquiry> }) => {
      const { error } = await supabase
        .from('property_inquiries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
    },
  });

  const filteredInquiries = inquiries?.filter(inquiry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.name.toLowerCase().includes(query) ||
      inquiry.email.toLowerCase().includes(query) ||
      inquiry.phone.includes(query) ||
      inquiry.property?.title?.toLowerCase().includes(query) ||
      inquiry.property?.location_area?.toLowerCase().includes(query)
    );
  });

  const formatAED = (amount: number) => 
    `AED ${amount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`;

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: inquiryId, updates: { status: newStatus } });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async (inquiryId: string, notes: string) => {
    try {
      await updateMutation.mutateAsync({ id: inquiryId, updates: { notes } });
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const exportInquiries = () => {
    if (!filteredInquiries) return;
    
    const csv = [
      ['Date', 'Name', 'Email', 'Phone', 'Type', 'Property', 'Area', 'Status', 'Agent Name', 'Agent Phone', 'Agency'].join(','),
      ...filteredInquiries.map(inquiry => {
        const agentData = inquiry.property?.bayut_agent_data as any;
        const agencyData = inquiry.property?.bayut_agency_data as any;
        return [
          format(new Date(inquiry.created_at), 'yyyy-MM-dd'),
          `"${inquiry.name}"`,
          inquiry.email,
          inquiry.phone,
          inquiry.inquiry_type,
          `"${inquiry.property?.title || ''}"`,
          inquiry.property?.location_area || '',
          inquiry.status,
          agentData?.agent_name || '',
          agentData?.agent_phone || '',
          agencyData?.agency_name || '',
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  // Stats calculation
  const stats = {
    total: inquiries?.length || 0,
    new: inquiries?.filter(i => i.status === 'new').length || 0,
    thisWeek: inquiries?.filter(i => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(i.created_at) >= weekAgo;
    }).length || 0,
    converted: inquiries?.filter(i => i.status === 'converted').length || 0,
  };

  return (
    <AdminLayout title="Property Inquiries">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <User className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Building2 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold">{stats.converted}</p>
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
            placeholder="Search by name, email, phone, property..."
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

        <Button variant="outline" onClick={exportInquiries}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inquiries...</div>
          ) : filteredInquiries?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No inquiries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-medium text-sm">Lead</th>
                    <th className="text-left p-4 font-medium text-sm">Property</th>
                    <th className="text-left p-4 font-medium text-sm">Type</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Date</th>
                    <th className="text-right p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries?.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{inquiry.name}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[300px]">
                          <p className="font-medium truncate">{inquiry.property?.title || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {inquiry.property?.location_area || '-'}
                          </p>
                          <p className="text-sm text-gold font-medium">
                            {inquiry.property?.price_aed ? formatAED(inquiry.property.price_aed) : '-'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {inquiry.inquiry_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Select
                          value={inquiry.status}
                          onValueChange={(v) => handleStatusChange(inquiry.id, v)}
                        >
                          <SelectTrigger className={`w-[130px] ${STATUS_COLORS[inquiry.status] || ''}`}>
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
                        {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        <br />
                        <span className="text-xs">{format(new Date(inquiry.created_at), 'h:mm a')}</span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inquiry);
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Lead Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    Lead Contact
                  </div>
                  <p className="font-medium">{selectedInquiry.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-gold hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${selectedInquiry.phone}`} className="text-gold hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    Property
                  </div>
                  <p className="font-medium">{selectedInquiry.property?.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedInquiry.property?.location_area}</p>
                  <p className="text-sm text-gold font-medium">
                    {selectedInquiry.property?.price_aed ? formatAED(selectedInquiry.property.price_aed) : '-'}
                  </p>
                  {selectedInquiry.property?.slug && (
                    <a 
                      href={`/properties/${selectedInquiry.property.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View Property <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Lead Message */}
              {selectedInquiry.message && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Message from Lead
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              )}

              {/* Original Listing Agent/Agency (from Bayut) */}
              {(selectedInquiry.property?.bayut_agent_data || selectedInquiry.property?.bayut_agency_data) && (
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-400">
                    🏢 Original Listing Agent (for outreach)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {(() => {
                      const agentData = selectedInquiry.property?.bayut_agent_data as any;
                      const agencyData = selectedInquiry.property?.bayut_agency_data as any;
                      return (
                        <>
                          {agentData?.agent_name && (
                            <div>
                              <span className="text-muted-foreground">Agent Name:</span>
                              <p className="font-medium">{agentData.agent_name}</p>
                            </div>
                          )}
                          {agentData?.agent_phone && (
                            <div>
                              <span className="text-muted-foreground">Agent Phone:</span>
                              <p className="font-medium">
                                <a href={`tel:${agentData.agent_phone}`} className="text-gold hover:underline">
                                  {agentData.agent_phone}
                                </a>
                              </p>
                            </div>
                          )}
                          {agentData?.agent_whatsapp && (
                            <div>
                              <span className="text-muted-foreground">WhatsApp:</span>
                              <p className="font-medium">
                                <a 
                                  href={`https://wa.me/${agentData.agent_whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-500 hover:underline"
                                >
                                  {agentData.agent_whatsapp}
                                </a>
                              </p>
                            </div>
                          )}
                          {agencyData?.agency_name && (
                            <div>
                              <span className="text-muted-foreground">Agency:</span>
                              <p className="font-medium">{agencyData.agency_name}</p>
                            </div>
                          )}
                          {agencyData?.agency_orn && (
                            <div>
                              <span className="text-muted-foreground">Agency ORN:</span>
                              <p className="font-medium">{agencyData.agency_orn}</p>
                            </div>
                          )}
                          {selectedInquiry.property?.developer_name && (
                            <div>
                              <span className="text-muted-foreground">Developer:</span>
                              <p className="font-medium">{selectedInquiry.property.developer_name}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  defaultValue={selectedInquiry.notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (selectedInquiry.notes || '')) {
                      handleNotesUpdate(selectedInquiry.id, e.target.value);
                    }
                  }}
                  placeholder="Add notes about this inquiry..."
                  rows={3}
                />
              </div>

              {/* Timestamps */}
              <div className="flex gap-6 text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Received: {format(new Date(selectedInquiry.created_at), 'MMM d, yyyy h:mm a')}
                </div>
                <div>
                  Source: <Badge variant="outline" className="ml-1">{selectedInquiry.source}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
