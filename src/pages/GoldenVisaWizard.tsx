import { useState } from 'react';
import { Award, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { GoldenVisaDisclaimer } from '@/components/ui/disclaimers';

interface GoldenVisaAnalysis {
  eligibilityScore: number;
  summary: string;
  recommendedPath: string;
  investmentRecommendations: {
    type: string;
    description: string;
    minimumInvestment: string;
    timeline: string;
    benefits: string[];
  }[];
  nextSteps: string[];
  considerations: string[];
}

const NATIONALITIES = [
  'American', 'British', 'Canadian', 'Australian', 'German', 'French', 
  'Indian', 'Chinese', 'Japanese', 'South Korean', 'Brazilian', 'Mexican',
  'Russian', 'Italian', 'Spanish', 'Dutch', 'Swiss', 'Swedish', 'Norwegian',
  'Saudi Arabian', 'Kuwaiti', 'Qatari', 'Egyptian', 'Lebanese', 'Pakistani', 'Other'
];

const BUDGET_RANGES = [
  'AED 2-3 Million',
  'AED 3-5 Million',
  'AED 5-10 Million',
  'AED 10-20 Million',
  'AED 20+ Million',
];

const INVESTMENT_TYPES = [
  'Real Estate',
  'Business Investment',
  'Startup/Entrepreneurship',
  'Mixed Portfolio',
  'Not Sure - Need Guidance',
];

const TIMELINES = [
  'Immediate (1-3 months)',
  'Short-term (3-6 months)',
  'Medium-term (6-12 months)',
  'Long-term (1-2 years)',
  'Exploring Options',
];

export default function GoldenVisaWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GoldenVisaAnalysis | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nationality: '',
    currentResidence: '',
    investmentBudget: '',
    investmentType: '',
    timeline: '',
    familySize: 1,
    additionalNotes: '',
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('golden-visa-wizard', {
        body: formData,
      });

      if (error) throw error;
      
      setAnalysis(data);
      setStep(4);
      
      // Save submission to database
      await supabase.from('golden_visa_submissions').insert({
        user_id: user?.id || null,
        full_name: formData.fullName,
        email: formData.email,
        nationality: formData.nationality,
        current_residence: formData.currentResidence,
        investment_budget: formData.investmentBudget,
        investment_type: formData.investmentType,
        timeline: formData.timeline,
        family_size: formData.familySize,
        additional_notes: formData.additionalNotes,
        ai_summary: data.summary,
        ai_recommendations: data.investmentRecommendations,
      });
      
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.nationality;
      case 2:
        return formData.currentResidence && formData.investmentBudget && formData.investmentType;
      case 3:
        return formData.timeline && formData.familySize > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Select
                value={formData.nationality}
                onValueChange={(value) => setFormData({ ...formData, nationality: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((nat) => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentResidence">Current Country of Residence</Label>
              <Input
                id="currentResidence"
                value={formData.currentResidence}
                onChange={(e) => setFormData({ ...formData, currentResidence: e.target.value })}
                placeholder="e.g., United States"
              />
            </div>
            <div className="space-y-2">
              <Label>Investment Budget</Label>
              <Select
                value={formData.investmentBudget}
                onValueChange={(value) => setFormData({ ...formData, investmentBudget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Investment Type</Label>
              <Select
                value={formData.investmentType}
                onValueChange={(value) => setFormData({ ...formData, investmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investment type" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => setFormData({ ...formData, timeline: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="When are you looking to invest?" />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="familySize">Family Size (including yourself)</Label>
              <Input
                id="familySize"
                type="number"
                min={1}
                max={20}
                value={formData.familySize}
                onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">
                Include spouse and dependents who will be included in the visa application
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any specific requirements, preferences, or questions..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case 4:
        return analysis ? (
          <div className="space-y-8">
            {/* Eligibility Score */}
            <div className="text-center p-6 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl border border-gold/30">
              <div className="text-5xl font-bold text-gold mb-2">{analysis.eligibilityScore}%</div>
              <div className="text-muted-foreground">Eligibility Score</div>
              <div className="mt-2 text-sm font-medium text-gold">{analysis.recommendedPath}</div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Personalized Summary</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
            </div>

            {/* Investment Recommendations */}
            {analysis.investmentRecommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Investment Recommendations</h3>
                <div className="space-y-4">
                  {analysis.investmentRecommendations.map((rec, index) => (
                    <div key={index} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gold">{rec.type}</h4>
                        <span className="text-sm text-muted-foreground">{rec.minimumInvestment}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>Timeline: {rec.timeline}</span>
                      </div>
                      {rec.benefits?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rec.benefits.map((benefit, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 text-gold text-xs">
                              <Check className="h-3 w-3" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysis.nextSteps?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
                <ol className="space-y-2">
                  {analysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Considerations */}
            {analysis.considerations?.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
                <ul className="space-y-2">
                  {analysis.considerations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-gold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setStep(1);
                  setAnalysis(null);
                  setFormData({
                    fullName: '',
                    email: '',
                    nationality: '',
                    currentResidence: '',
                    investmentBudget: '',
                    investmentType: '',
                    timeline: '',
                    familySize: 1,
                    additionalNotes: '',
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Start New Assessment
              </Button>
              <Button className="flex-1 bg-gold hover:bg-gold/90 text-background">
                Schedule Consultation
              </Button>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
              <Award className="h-8 w-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Golden Visa Wizard</h1>
            <p className="text-muted-foreground">
              Get personalized AI-powered guidance for your UAE Golden Visa journey
            </p>
            <p className="text-xs text-muted-foreground mt-2">Results are for informational purposes only — not legal or immigration advice.</p>
          </div>

          {/* Progress Steps */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s === step
                        ? 'bg-gold text-background'
                        : s < step
                        ? 'bg-gold/20 text-gold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-0.5 ${s < step ? 'bg-gold' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {step < 4 && (
              <h2 className="text-xl font-semibold mb-6">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Investment Details'}
                {step === 3 && 'Timeline & Preferences'}
              </h2>
            )}

            {renderStep()}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="bg-gold hover:bg-gold/90 text-background"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                    className="bg-gold hover:bg-gold/90 text-background"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Get My Analysis
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Disclaimer after form */}
          <GoldenVisaDisclaimer className="mt-6" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
