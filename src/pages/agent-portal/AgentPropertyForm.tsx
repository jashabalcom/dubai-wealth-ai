import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex'];
const LISTING_TYPES = ['sale', 'rent'];

export default function AgentPropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agent } = useAgentAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_aed: '',
    property_type: 'Apartment',
    listing_type: 'sale',
    bedrooms: '1',
    bathrooms: '1',
    size_sqft: '',
    location_area: '',
    community_id: '',
    rera_permit_number: '',
  });

  const isEdit = !!id;

  useEffect(() => {
    fetchCommunities();
    if (isEdit) {
      fetchProperty();
    }
  }, [id]);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from('communities')
      .select('id, name')
      .order('name');
    if (data) setCommunities(data);
  };

  const fetchProperty = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      toast({ title: "Error", description: "Property not found", variant: "destructive" });
      navigate('/agent-portal/listings');
      return;
    }

    setFormData({
      title: data.title || '',
      description: data.description || '',
      price_aed: data.price_aed?.toString() || '',
      property_type: data.property_type || 'Apartment',
      listing_type: data.listing_type || 'sale',
      bedrooms: data.bedrooms?.toString() || '1',
      bathrooms: data.bathrooms?.toString() || '1',
      size_sqft: data.size_sqft?.toString() || '',
      location_area: data.location_area || '',
      community_id: data.community_id || '',
      rera_permit_number: data.rera_permit_number || '',
    });
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setSaving(true);
    try {
      const propertyData = {
        title: formData.title,
        slug: generateSlug(formData.title),
        description: formData.description,
        price_aed: parseFloat(formData.price_aed) || 0,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        size_sqft: parseFloat(formData.size_sqft) || 0,
        location_area: formData.location_area,
        community_id: formData.community_id || null,
        rera_permit_number: formData.rera_permit_number,
        agent_id: agent.id,
        is_published: false,
        status: 'available',
      };

      if (isEdit) {
        const { slug, ...updateData } = propertyData;
        const { error } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
        toast({ title: "Property Updated", description: "Your changes have been saved." });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert(propertyData);
        if (error) throw error;
        toast({ title: "Property Submitted", description: "Your listing is pending review." });
      }

      navigate('/agent-portal/listings');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agent-portal/listings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update your listing details' : 'Submit a new listing for review'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Basic information about the property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Stunning 2BR Apartment in Dubai Marina"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Type *</Label>
                <Select value={formData.property_type} onValueChange={(v) => setFormData({ ...formData, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Listing Type *</Label>
                <Select value={formData.listing_type} onValueChange={(v) => setFormData({ ...formData, listing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map(t => <SelectItem key={t} value={t}>{t === 'sale' ? 'For Sale' : 'For Rent'}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (AED) *</Label>
                <Input id="price" type="number" placeholder="1500000" value={formData.price_aed} onChange={(e) => setFormData({ ...formData, price_aed: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select value={formData.bedrooms} onValueChange={(v) => setFormData({ ...formData, bedrooms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['0', '1', '2', '3', '4', '5', '6'].map(b => <SelectItem key={b} value={b}>{b === '0' ? 'Studio' : b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select value={formData.bathrooms} onValueChange={(v) => setFormData({ ...formData, bathrooms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3', '4', '5', '6'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (sqft) *</Label>
              <Input id="size" type="number" placeholder="1200" value={formData.size_sqft} onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the property features, views, amenities..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Community/Area</Label>
                <Select value={formData.community_id} onValueChange={(v) => setFormData({ ...formData, community_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger>
                  <SelectContent>
                    {communities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Location Area *</Label>
                <Input id="area" placeholder="e.g., Dubai Marina" value={formData.location_area} onChange={(e) => setFormData({ ...formData, location_area: e.target.value })} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RERA Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rera">RERA Permit Number</Label>
              <Input id="rera" placeholder="RERA permit number for this listing" value={formData.rera_permit_number} onChange={(e) => setFormData({ ...formData, rera_permit_number: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/agent-portal/listings')}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />{isEdit ? 'Save Changes' : 'Submit for Review'}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
