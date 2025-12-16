import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { 
  useMortgagePartners, 
  useCreateMortgagePartner, 
  useUpdateMortgagePartner,
  useDeleteMortgagePartner,
  MortgagePartner 
} from '@/hooks/useMortgageLeads';
import { Plus, Pencil, Trash2, Building2, Star, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PARTNERSHIP_TYPES = [
  { value: 'cpl', label: 'Cost Per Lead (CPL)' },
  { value: 'cpa', label: 'Cost Per Acquisition (CPA)' },
  { value: 'hybrid', label: 'Hybrid (CPL + CPA)' },
  { value: 'sponsorship', label: 'Monthly Sponsorship' },
];

export default function AdminMortgagePartners() {
  const { data: partners, isLoading } = useMortgagePartners();
  const createPartner = useCreateMortgagePartner();
  const updatePartner = useUpdateMortgagePartner();
  const deletePartner = useDeleteMortgagePartner();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<MortgagePartner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    base_rate: '',
    max_ltv: '80',
    processing_fee_percent: '1',
    min_loan_amount: '500000',
    max_loan_amount: '',
    partnership_type: 'cpl',
    cpl_amount: '100',
    cpa_amount: '0',
    sponsorship_monthly: '0',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    is_active: true,
    is_featured: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      description: '',
      base_rate: '',
      max_ltv: '80',
      processing_fee_percent: '1',
      min_loan_amount: '500000',
      max_loan_amount: '',
      partnership_type: 'cpl',
      cpl_amount: '100',
      cpa_amount: '0',
      sponsorship_monthly: '0',
      contact_email: '',
      contact_phone: '',
      website_url: '',
      is_active: true,
      is_featured: false,
    });
    setEditingPartner(null);
  };

  const openEditDialog = (partner: MortgagePartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url || '',
      description: partner.description || '',
      base_rate: partner.base_rate?.toString() || '',
      max_ltv: partner.max_ltv.toString(),
      processing_fee_percent: partner.processing_fee_percent.toString(),
      min_loan_amount: partner.min_loan_amount.toString(),
      max_loan_amount: partner.max_loan_amount?.toString() || '',
      partnership_type: partner.partnership_type,
      cpl_amount: partner.cpl_amount.toString(),
      cpa_amount: partner.cpa_amount.toString(),
      sponsorship_monthly: partner.sponsorship_monthly.toString(),
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      website_url: partner.website_url || '',
      is_active: partner.is_active,
      is_featured: partner.is_featured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const partnerData = {
      name: formData.name,
      logo_url: formData.logo_url || null,
      description: formData.description || null,
      base_rate: formData.base_rate ? parseFloat(formData.base_rate) : null,
      max_ltv: parseInt(formData.max_ltv),
      processing_fee_percent: parseFloat(formData.processing_fee_percent),
      min_loan_amount: parseInt(formData.min_loan_amount),
      max_loan_amount: formData.max_loan_amount ? parseInt(formData.max_loan_amount) : null,
      partnership_type: formData.partnership_type,
      cpl_amount: parseFloat(formData.cpl_amount),
      cpa_amount: parseFloat(formData.cpa_amount),
      sponsorship_monthly: parseFloat(formData.sponsorship_monthly),
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      website_url: formData.website_url || null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    };

    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({ id: editingPartner.id, updates: partnerData });
        toast.success('Partner updated successfully');
      } else {
        await createPartner.mutateAsync(partnerData);
        toast.success('Partner created successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save partner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    
    try {
      await deletePartner.mutateAsync(id);
      toast.success('Partner deleted successfully');
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const handleToggleActive = async (partner: MortgagePartner) => {
    try {
      await updatePartner.mutateAsync({ 
        id: partner.id, 
        updates: { is_active: !partner.is_active } 
      });
      toast.success(`Partner ${partner.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update partner status');
    }
  };

  const handleToggleFeatured = async (partner: MortgagePartner) => {
    try {
      await updatePartner.mutateAsync({ 
        id: partner.id, 
        updates: { is_featured: !partner.is_featured } 
      });
      toast.success(`Partner ${partner.is_featured ? 'unfeatured' : 'featured'}`);
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const activePartners = partners?.filter(p => p.is_active).length || 0;
  const featuredPartners = partners?.filter(p => p.is_featured).length || 0;

  return (
    <AdminLayout title="Mortgage Partners">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{partners?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{activePartners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Featured Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gold">{featuredPartners}</p>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">All Partners</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Partner Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Emirates NBD"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Logo</Label>
                    <ImageUploader
                      currentImageUrl={formData.logo_url}
                      onUpload={(url) => setFormData({ ...formData, logo_url: url })}
                      bucket="property-media"
                      folder="partner-logos"
                      aspectRatio={2}
                      label="Upload Logo"
                      previewClassName="h-20 w-40 object-contain"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the partner..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Website URL</Label>
                    <Input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Rate Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Rate Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.base_rate}
                      onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                      placeholder="e.g., 4.99"
                    />
                  </div>
                  <div>
                    <Label>Max LTV (%) *</Label>
                    <Input
                      type="number"
                      value={formData.max_ltv}
                      onChange={(e) => setFormData({ ...formData, max_ltv: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Processing Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.processing_fee_percent}
                      onChange={(e) => setFormData({ ...formData, processing_fee_percent: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Min Loan Amount (AED)</Label>
                    <Input
                      type="number"
                      value={formData.min_loan_amount}
                      onChange={(e) => setFormData({ ...formData, min_loan_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Loan Amount (AED)</Label>
                    <Input
                      type="number"
                      value={formData.max_loan_amount}
                      onChange={(e) => setFormData({ ...formData, max_loan_amount: e.target.value })}
                      placeholder="Leave empty for no limit"
                    />
                  </div>
                </div>
              </div>

              {/* Partnership Terms */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Partnership Terms</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Partnership Type</Label>
                    <Select
                      value={formData.partnership_type}
                      onValueChange={(value) => setFormData({ ...formData, partnership_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNERSHIP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>CPL Amount (AED)</Label>
                    <Input
                      type="number"
                      value={formData.cpl_amount}
                      onChange={(e) => setFormData({ ...formData, cpl_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CPA Amount (AED)</Label>
                    <Input
                      type="number"
                      value={formData.cpa_amount}
                      onChange={(e) => setFormData({ ...formData, cpa_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Monthly Sponsorship (AED)</Label>
                    <Input
                      type="number"
                      value={formData.sponsorship_monthly}
                      onChange={(e) => setFormData({ ...formData, sponsorship_monthly: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="leads@bank.com"
                    />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+971..."
                    />
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Display Options</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label>Featured</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPartner.isPending || updatePartner.isPending}>
                  {(createPartner.isPending || updatePartner.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingPartner ? 'Update Partner' : 'Create Partner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partners Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : partners?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Partners Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first mortgage partner to start receiving leads.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>Partnership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners?.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.name}
                          className="h-10 w-20 object-contain rounded"
                        />
                      ) : (
                        <div className="h-10 w-20 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {partner.name}
                          {partner.is_featured && (
                            <Star className="h-3 w-3 text-gold fill-gold" />
                          )}
                        </div>
                        {partner.website_url && (
                          <a 
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {partner.base_rate && (
                        <div>Rate: {partner.base_rate}%</div>
                      )}
                      <div className="text-muted-foreground">
                        Max LTV: {partner.max_ltv}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="mb-1">
                        {PARTNERSHIP_TYPES.find(t => t.value === partner.partnership_type)?.label || partner.partnership_type}
                      </Badge>
                      {partner.cpl_amount > 0 && (
                        <div className="text-muted-foreground">
                          CPL: AED {partner.cpl_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={partner.is_active}
                          onCheckedChange={() => handleToggleActive(partner)}
                        />
                        <span className="text-xs">
                          {partner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={partner.is_featured}
                          onCheckedChange={() => handleToggleFeatured(partner)}
                        />
                        <span className="text-xs">
                          {partner.is_featured ? 'Featured' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(partner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(partner.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AdminLayout>
  );
}
