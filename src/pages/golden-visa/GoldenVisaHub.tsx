import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Check, ArrowRight, Building2, Calculator, FileText, MapPin, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateBreadcrumbSchema, generateFAQSchema, SITE_CONFIG } from '@/lib/seo-config';

const VISA_TYPES = [
  {
    name: '10-Year Golden Visa',
    requirement: 'AED 2 Million Property Investment',
    benefits: [
      'Long-term UAE residency',
      'Sponsor spouse and children',
      'No sponsor required',
      'Work or start a business',
      'No minimum stay requirement',
    ],
    eligibility: [
      'Property value ≥ AED 2 million',
      'Property can be mortgaged (with ≥ AED 2M equity)',
      'Ready or off-plan property',
      'Single or multiple properties',
    ],
  },
  {
    name: '5-Year Investor Visa (Retired)',
    requirement: 'AED 1 Million Property (Historical)',
    benefits: [
      '5-year renewable residency',
      'Sponsor family members',
      'Multiple entry visa',
    ],
    eligibility: [
      'This visa category was retired in 2023',
      'Now requires AED 2 million minimum',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "What is the minimum property value for UAE Golden Visa?",
    answer: "The minimum property investment for UAE Golden Visa is AED 2 million. This can be a single property or combined value of multiple properties. The property can be mortgaged, but you must have at least AED 2 million in equity."
  },
  {
    question: "Can I get Golden Visa with an off-plan property?",
    answer: "Yes, you can qualify for Golden Visa with off-plan property worth AED 2 million or more. Some developers offer Golden Visa packages. The visa is typically processed once you've paid a significant portion or upon handover."
  },
  {
    question: "How long does Golden Visa processing take?",
    answer: "Golden Visa processing typically takes 2-4 weeks once all documents are submitted. The process includes document verification, medical fitness test, and Emirates ID registration. Some VIP services offer expedited processing."
  },
  {
    question: "Can my family get Golden Visa through my property investment?",
    answer: "Yes, you can sponsor your spouse and children (unmarried, any age) under your Golden Visa. You can also sponsor domestic helpers. Each dependent gets the same 10-year visa validity."
  },
  {
    question: "Do I need to live in UAE to maintain Golden Visa?",
    answer: "No, there's no minimum stay requirement for Golden Visa holders. Unlike regular residency visas that expire if you stay outside UAE for 6+ months, Golden Visa remains valid regardless of your time spent outside the country."
  },
  {
    question: "Can I work or start a business with Golden Visa?",
    answer: "Yes, Golden Visa holders can work for any employer in the UAE, start their own business, or be self-employed. There are no restrictions on employment or business activities."
  },
];

const PROCESS_STEPS = [
  { step: 1, title: 'Purchase Property', description: 'Buy property worth ≥ AED 2 million in a freehold area' },
  { step: 2, title: 'Get Title Deed', description: 'Obtain your title deed from Dubai Land Department' },
  { step: 3, title: 'Apply for Visa', description: 'Submit application through ICP or GDRFA portal' },
  { step: 4, title: 'Medical Test', description: 'Complete medical fitness test at approved center' },
  { step: 5, title: 'Emirates ID', description: 'Get biometrics and receive Emirates ID' },
  { step: 6, title: 'Visa Stamping', description: 'Receive your 10-year Golden Visa stamp' },
];

export default function GoldenVisaHub() {
  return (
    <>
      <SEOHead
        title="Dubai Golden Visa Through Property 2025 — Complete Guide & Requirements"
        description="Get UAE Golden Visa through property investment. AED 2 million minimum, 10-year residency, sponsor family. Complete guide with requirements, process, and eligible properties."
        keywords={[
          'Dubai Golden Visa',
          'UAE Golden Visa property',
          'Golden Visa requirements 2025',
          '10 year visa Dubai',
          'investor visa UAE',
          'UAE residency through property',
          'Golden Visa AED 2 million',
          'Dubai long term visa',
        ]}
        canonical={`${SITE_CONFIG.url}/golden-visa`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Golden Visa', url: `${SITE_CONFIG.url}/golden-visa` },
          ]),
          generateFAQSchema(FAQ_ITEMS),
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-gold/10 via-background to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-50" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-20 h-20 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-gold" />
              </div>
              
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">
                10-Year UAE Residency
              </Badge>
              
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                UAE <span className="text-gradient-gold">Golden Visa</span> Through Property
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Secure long-term UAE residency by investing AED 2 million in Dubai property. 
                Sponsor your family, work freely, and enjoy tax-free living.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/golden-visa/properties">
                  <Button size="lg" className="bg-gold hover:bg-gold/90 text-background">
                    <Building2 className="w-5 h-5 mr-2" />
                    View Eligible Properties
                  </Button>
                </Link>
                <Link to="/golden-visa/calculator">
                  <Button size="lg" variant="outline" className="border-gold/30">
                    <Calculator className="w-5 h-5 mr-2" />
                    Check Eligibility
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: 'AED 2M', label: 'Minimum Investment' },
                { value: '10 Years', label: 'Visa Validity' },
                { value: '2-4 Weeks', label: 'Processing Time' },
                { value: 'Unlimited', label: 'Family Sponsors' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              Golden Visa Benefits
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Award, title: '10-Year Residency', desc: 'Long-term renewable visa without sponsor' },
                { icon: Users, title: 'Sponsor Family', desc: 'Include spouse, children, and domestic staff' },
                { icon: Building2, title: 'Property Ownership', desc: 'Full freehold ownership rights in Dubai' },
                { icon: MapPin, title: 'No Stay Requirement', desc: 'Maintain visa without living in UAE' },
                { icon: FileText, title: 'Work Freely', desc: 'Employment or business with no restrictions' },
                { icon: Check, title: 'Tax Benefits', desc: '0% income tax, 0% capital gains tax' },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              How to Get Golden Visa
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROCESS_STEPS.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="bg-card border border-border rounded-xl p-6">
                      <div className="w-10 h-10 rounded-full bg-gold text-background font-bold flex items-center justify-center mb-4">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ_ITEMS.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-gold/10 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Start Your Golden Visa Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse Golden Visa eligible properties or use our eligibility calculator 
              to understand your options.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/golden-visa/properties">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-background">
                  View Eligible Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/golden-visa/requirements">
                <Button size="lg" variant="outline">
                  <FileText className="w-5 h-5 mr-2" />
                  Full Requirements
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl text-foreground mb-6">Related Resources</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link to="/golden-visa/properties" className="p-4 bg-card border border-border rounded-lg hover:border-gold/50 transition-colors">
                <Building2 className="w-5 h-5 text-gold mb-2" />
                <h3 className="font-medium text-foreground">Eligible Properties</h3>
                <p className="text-sm text-muted-foreground">Browse AED 2M+ properties</p>
              </Link>
              <Link to="/golden-visa/requirements" className="p-4 bg-card border border-border rounded-lg hover:border-gold/50 transition-colors">
                <FileText className="w-5 h-5 text-gold mb-2" />
                <h3 className="font-medium text-foreground">Requirements</h3>
                <p className="text-sm text-muted-foreground">Documents & criteria</p>
              </Link>
              <Link to="/golden-visa/calculator" className="p-4 bg-card border border-border rounded-lg hover:border-gold/50 transition-colors">
                <Calculator className="w-5 h-5 text-gold mb-2" />
                <h3 className="font-medium text-foreground">Eligibility Checker</h3>
                <p className="text-sm text-muted-foreground">Check your eligibility</p>
              </Link>
              <Link to="/invest" className="p-4 bg-card border border-border rounded-lg hover:border-gold/50 transition-colors">
                <Award className="w-5 h-5 text-gold mb-2" />
                <h3 className="font-medium text-foreground">Investment Guide</h3>
                <p className="text-sm text-muted-foreground">Full investment strategy</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
