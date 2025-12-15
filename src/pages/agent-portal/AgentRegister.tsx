import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandLogo } from '@/components/BrandLogo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { useAuth } from '@/hooks/useAuth';

const SPECIALIZATIONS = [
  'Off-Plan Projects',
  'Ready Properties',
  'Luxury Villas',
  'Apartments',
  'Commercial',
  'Investment Properties',
  'Holiday Homes',
  'Townhouses',
];

const LANGUAGES = [
  'English',
  'Arabic',
  'Russian',
  'Chinese',
  'French',
  'Hindi',
  'Urdu',
  'Spanish',
];

interface Brokerage {
  id: string;
  name: string;
}

export default function AgentRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '+971',
    whatsapp: '',
    reraBrn: '',
    brokerageId: '',
    yearsExperience: '',
    specializations: [] as string[],
    languages: ['English'] as string[],
  });

  useEffect(() => {
    fetchBrokerages();
  }, []);

  // If user is already logged in and has an agent profile, redirect
  useEffect(() => {
    const checkExistingAgent = async () => {
      if (user) {
        const { data: agent } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (agent) {
          navigate('/agent-portal/dashboard');
        }
      }
    };
    checkExistingAgent();
  }, [user, navigate]);

  const fetchBrokerages = async () => {
    const { data } = await supabase
      .from('brokerages')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (data) setBrokerages(data);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate RERA BRN
      if (!formData.reraBrn.trim()) {
        throw new Error('RERA BRN is required for agent registration');
      }

      let userId = user?.id;

      // If not already logged in, create auth account
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/agent-portal/dashboard`,
          }
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      }

      if (!userId) {
        throw new Error('Failed to create user account');
      }

      // Create agent profile
      const { error: agentError } = await supabase
        .from('agents')
        .insert({
          user_id: userId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          rera_brn: formData.reraBrn,
          brokerage_id: formData.brokerageId && formData.brokerageId !== 'independent' ? formData.brokerageId : null,
          years_experience: parseInt(formData.yearsExperience) || 0,
          specializations: formData.specializations,
          languages: formData.languages,
          subscription_tier: 'basic',
          max_listings: 100, // Generous free limit
          is_active: true,
        });

      if (agentError) throw agentError;

      toast({
        title: "Registration Successful!",
        description: "Welcome to Dubai Wealth Hub. Let's set up your first listing.",
      });

      navigate('/agent-portal/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background py-12 px-4">
      <SEOHead
        title="Agent Registration | Dubai Wealth Hub"
        description="Register as an agent on Dubai Wealth Hub. List your properties to verified global investors for free."
      />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <Link to="/agent-portal" className="inline-block">
              <BrandLogo size="lg" />
            </Link>
            <p className="text-muted-foreground mt-2">Agent Registration</p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Create Your Agent Profile</CardTitle>
              <CardDescription>
                Join our network and start listing your properties to verified investors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    Account Information
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Smith"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="agent@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={!!user}
                      />
                    </div>
                  </div>

                  {!user && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    Contact Information
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp (if different)</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    Professional Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reraBrn">RERA BRN *</Label>
                      <Input
                        id="reraBrn"
                        placeholder="12345"
                        value={formData.reraBrn}
                        onChange={(e) => setFormData({ ...formData, reraBrn: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Your RERA Broker Registration Number
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Select 
                        value={formData.yearsExperience}
                        onValueChange={(value) => setFormData({ ...formData, yearsExperience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3-5 years</SelectItem>
                          <SelectItem value="6">6-10 years</SelectItem>
                          <SelectItem value="11">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brokerage">Brokerage</Label>
                    <Select 
                      value={formData.brokerageId}
                      onValueChange={(value) => setFormData({ ...formData, brokerageId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your brokerage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Other / Independent</SelectItem>
                        {brokerages.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    Specializations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.specializations.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    Languages Spoken
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {LANGUAGES.map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => toggleLanguage(lang)}
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Benefits Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">What You Get (Free):</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        'Up to 100 property listings',
                        'Exposure to verified investors',
                        'Curated lead matching',
                        'RERA-verified profile badge',
                      ].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Agent Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Already registered?{' '}
                  <Link to="/agent-portal/login" className="text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
                <Link 
                  to="/agent-portal" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Agent Portal
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
