import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Building2, Phone, Mail, User } from 'lucide-react';

interface MortgageLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorData: {
    propertyPrice: number;
    downPaymentPercent: number;
    downPaymentAmount: number;
    loanAmount: number;
    interestRate: number;
    loanTermYears: number;
    monthlyPayment: number;
  };
  propertyContext?: {
    propertyId?: string;
    propertyArea?: string;
    propertyType?: string;
    isOffPlan?: boolean;
  };
}

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'retired', label: 'Retired' },
];

const INCOME_OPTIONS = [
  { value: 'under_15k', label: 'Under AED 15,000' },
  { value: '15k_30k', label: 'AED 15,000 - 30,000' },
  { value: '30k_50k', label: 'AED 30,000 - 50,000' },
  { value: '50k_100k', label: 'AED 50,000 - 100,000' },
  { value: '100k_plus', label: 'AED 100,000+' },
];

const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Ready to Buy Now' },
  { value: '1_3_months', label: '1-3 Months' },
  { value: '3_6_months', label: '3-6 Months' },
  { value: '6_12_months', label: '6-12 Months' },
  { value: 'researching', label: 'Just Researching' },
];

const CONTACT_OPTIONS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

export function MortgageLeadForm({ open, onOpenChange, calculatorData, propertyContext }: MortgageLeadFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    employmentStatus: '',
    monthlyIncomeRange: '',
    purchaseTimeline: '',
    preferredContactMethod: 'phone',
    firstTimeBuyer: false,
    existingMortgage: false,
    uaeResident: true,
    consentBankContact: false,
    consentMarketing: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentBankContact) {
      toast.error('Please consent to be contacted by our mortgage partners');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate lead score
      let leadScore = 50;
      if (formData.purchaseTimeline === 'immediate') leadScore += 25;
      else if (formData.purchaseTimeline === '1_3_months') leadScore += 20;
      else if (formData.purchaseTimeline === '3_6_months') leadScore += 10;
      
      if (formData.monthlyIncomeRange === '100k_plus') leadScore += 15;
      else if (formData.monthlyIncomeRange === '50k_100k') leadScore += 10;
      else if (formData.monthlyIncomeRange === '30k_50k') leadScore += 5;
      
      if (formData.uaeResident) leadScore += 5;
      if (!formData.existingMortgage) leadScore += 5;

      const { error } = await supabase.from('mortgage_leads').insert({
        user_id: user?.id,
        property_price: calculatorData.propertyPrice,
        down_payment_percent: calculatorData.downPaymentPercent,
        down_payment_amount: calculatorData.downPaymentAmount,
        loan_amount: calculatorData.loanAmount,
        interest_rate: calculatorData.interestRate,
        loan_term_years: calculatorData.loanTermYears,
        monthly_payment: calculatorData.monthlyPayment,
        property_id: propertyContext?.propertyId,
        property_area: propertyContext?.propertyArea,
        property_type: propertyContext?.propertyType,
        is_off_plan: propertyContext?.isOffPlan || false,
        employment_status: formData.employmentStatus,
        monthly_income_range: formData.monthlyIncomeRange,
        purchase_timeline: formData.purchaseTimeline,
        first_time_buyer: formData.firstTimeBuyer,
        existing_mortgage: formData.existingMortgage,
        uae_resident: formData.uaeResident,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferred_contact_method: formData.preferredContactMethod,
        consent_bank_contact: formData.consentBankContact,
        consent_marketing: formData.consentMarketing,
        lead_score: Math.min(100, leadScore),
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        referrer_url: document.referrer || null,
      });

      if (error) throw error;

      // Send email notifications (fire and forget - don't block success)
      supabase.functions.invoke('send-mortgage-lead-email', {
        body: {
          leadData: {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            property_price: calculatorData.propertyPrice,
            down_payment_amount: calculatorData.downPaymentAmount,
            down_payment_percent: calculatorData.downPaymentPercent,
            loan_amount: calculatorData.loanAmount,
            interest_rate: calculatorData.interestRate,
            loan_term_years: calculatorData.loanTermYears,
            monthly_payment: calculatorData.monthlyPayment,
            employment_status: formData.employmentStatus,
            monthly_income_range: formData.monthlyIncomeRange,
            purchase_timeline: formData.purchaseTimeline,
            first_time_buyer: formData.firstTimeBuyer,
          }
        }
      }).catch(err => console.error('Email notification error:', err));

      setIsSuccess(true);
      toast.success('Application submitted! Our mortgage specialists will contact you shortly.');
    } catch (error: any) {
      console.error('Error submitting mortgage lead:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAED = (amount: number) => 
    `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-heading text-2xl mb-2">Application Received!</h3>
            <p className="text-muted-foreground mb-6">
              Our mortgage specialists will review your application and contact you within 24 hours 
              to discuss the best financing options for your Dubai property.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gold" />
            Get Pre-Qualified for a Mortgage
          </DialogTitle>
          <DialogDescription>
            Complete this form to receive personalized mortgage options from our partner banks.
          </DialogDescription>
        </DialogHeader>

        {/* Pre-filled Calculator Summary */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
          <p className="text-sm text-muted-foreground mb-2">Your Mortgage Request</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Property Price:</span>
              <p className="font-medium">{formatAED(calculatorData.propertyPrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Loan Amount:</span>
              <p className="font-medium">{formatAED(calculatorData.loanAmount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Down Payment:</span>
              <p className="font-medium">{formatAED(calculatorData.downPaymentAmount)} ({calculatorData.downPaymentPercent}%)</p>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Monthly:</span>
              <p className="font-medium text-gold">{formatAED(calculatorData.monthlyPayment)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Contact Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="pl-10"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder="+971 50 123 4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <Select
                  value={formData.preferredContactMethod}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, preferredContactMethod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Qualification Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Qualification Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Employment Status *</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, employmentStatus: v }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Monthly Income *</Label>
                <Select
                  value={formData.monthlyIncomeRange}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, monthlyIncomeRange: v }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Purchase Timeline *</Label>
                <Select
                  value={formData.purchaseTimeline}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, purchaseTimeline: v }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="firstTimeBuyer"
                  checked={formData.firstTimeBuyer}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, firstTimeBuyer: checked as boolean }))}
                />
                <Label htmlFor="firstTimeBuyer" className="text-sm cursor-pointer">First-time buyer in UAE</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="existingMortgage"
                  checked={formData.existingMortgage}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, existingMortgage: checked as boolean }))}
                />
                <Label htmlFor="existingMortgage" className="text-sm cursor-pointer">Have existing mortgage</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="uaeResident"
                  checked={formData.uaeResident}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, uaeResident: checked as boolean }))}
                />
                <Label htmlFor="uaeResident" className="text-sm cursor-pointer">UAE Resident</Label>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-start gap-2">
              <Checkbox
                id="consentBankContact"
                checked={formData.consentBankContact}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentBankContact: checked as boolean }))}
              />
              <Label htmlFor="consentBankContact" className="text-sm cursor-pointer leading-relaxed">
                I consent to being contacted by mortgage specialists and partner banks regarding my application. *
              </Label>
            </div>
            
            <div className="flex items-start gap-2">
              <Checkbox
                id="consentMarketing"
                checked={formData.consentMarketing}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentMarketing: checked as boolean }))}
              />
              <Label htmlFor="consentMarketing" className="text-sm cursor-pointer leading-relaxed">
                I would like to receive updates about market rates and mortgage offers.
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold/90 text-primary-foreground"
            disabled={isSubmitting || !formData.employmentStatus || !formData.monthlyIncomeRange || !formData.purchaseTimeline}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting, you agree to our Privacy Policy. Your information is secure and will only be shared with verified mortgage partners.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
