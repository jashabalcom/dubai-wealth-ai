import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Target, Wallet, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: number;
}

const investmentGoals = [
  { value: 'capital_growth', label: 'Capital Growth', description: 'Long-term appreciation' },
  { value: 'passive_income', label: 'Passive Income', description: 'Rental yield focus' },
  { value: 'golden_visa', label: 'Golden Visa', description: 'Residency through investment' },
  { value: 'portfolio_diversification', label: 'Portfolio Diversification', description: 'Global asset allocation' },
];

const budgetRanges = [
  { value: 'under_500k', label: 'Under AED 500K' },
  { value: '500k_1m', label: 'AED 500K - 1M' },
  { value: '1m_2m', label: 'AED 1M - 2M' },
  { value: '2m_5m', label: 'AED 2M - 5M' },
  { value: '5m_plus', label: 'AED 5M+' },
];

const timelines = [
  { value: 'immediate', label: 'Ready to invest now' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: 'exploring', label: 'Just exploring' },
];

const countries = [
  'United States', 'United Kingdom', 'India', 'Pakistan', 'China', 
  'Russia', 'Germany', 'France', 'Canada', 'Australia', 
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Other'
];

const steps = [
  { icon: Target, title: 'Investment Goals', description: 'What are you looking to achieve?' },
  { icon: Wallet, title: 'Budget & Timeline', description: 'Help us personalize your experience' },
  { icon: MapPin, title: 'About You', description: 'Tell the community who you are' },
  { icon: Camera, title: 'Profile Photo', description: 'Add a photo to build trust' },
];

export function ProfileWizard({ isOpen, onClose, onComplete, initialStep = 0 }: ProfileWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    investment_goal: '',
    budget_range: '',
    timeline: '',
    country: '',
    bio: '',
    linkedin_url: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      let avatarUrl = null;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // Update profile
      const updateData: Record<string, unknown> = {
        ...formData,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_step: 4,
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile setup complete!');
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.investment_goal;
      case 1:
        return !!formData.budget_range && !!formData.timeline;
      case 2:
        return !!formData.country;
      case 3:
        return true; // Avatar is optional
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        {/* Progress bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 flex items-center">
                <div 
                  className={`w-full h-1.5 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-gold' : 'bg-muted'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              {(() => {
                const StepIcon = steps[currentStep].icon;
                return <StepIcon className="w-5 h-5 text-gold" />;
              })()}
            </div>
            <div>
              <h3 className="font-heading text-lg text-foreground">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <RadioGroup
                  value={formData.investment_goal}
                  onValueChange={(value) => updateField('investment_goal', value)}
                  className="space-y-3"
                >
                  {investmentGoals.map((goal) => (
                    <label
                      key={goal.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.investment_goal === goal.value
                          ? 'border-gold bg-gold/5'
                          : 'border-border hover:border-gold/30'
                      }`}
                    >
                      <RadioGroupItem value={goal.value} />
                      <div>
                        <div className="font-medium text-foreground">{goal.label}</div>
                        <div className="text-sm text-muted-foreground">{goal.description}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Investment Budget</Label>
                    <Select
                      value={formData.budget_range}
                      onValueChange={(value) => updateField('budget_range', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((budget) => (
                          <SelectItem key={budget.value} value={budget.value}>
                            {budget.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Investment Timeline</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(value) => updateField('timeline', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="When are you looking to invest?" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline.value} value={timeline.value}>
                            {timeline.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => updateField('country', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Where are you based?" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Bio (optional)</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Tell others about yourself and your investment interests..."
                      className="mt-2 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-foreground">LinkedIn URL (optional)</Label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => updateField('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center">
                  <div className="mb-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gold"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" asChild className="cursor-pointer">
                      <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
                    </Button>
                  </label>

                  <p className="text-sm text-muted-foreground mt-4">
                    A profile photo helps build trust with other investors
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            variant="gold"
            onClick={handleNext}
            disabled={!canProceed() || saving}
          >
            {saving ? (
              'Saving...'
            ) : currentStep === steps.length - 1 ? (
              <>
                Complete
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
