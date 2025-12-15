import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandLogo } from '@/components/BrandLogo';
import { SEOHead } from '@/components/SEOHead';

const benefits = [
  {
    icon: Users,
    title: 'Pre-Qualified Investors',
    description: 'Every lead is verified by investment budget, goals, and timeline before we connect them to you.'
  },
  {
    icon: Shield,
    title: 'Curated Matching',
    description: 'We don\'t just blast leads — we match investors to properties based on their specific criteria.'
  },
  {
    icon: Globe,
    title: 'Global Investor Network',
    description: 'Access our community of international investors from 50+ countries actively exploring Dubai.'
  },
  {
    icon: TrendingUp,
    title: 'Zero Cost, Zero Risk',
    description: 'List your properties free with no subscription fees and no exclusivity requirements.'
  }
];

const steps = [
  {
    number: '01',
    title: 'Create Your Agent Profile',
    description: 'Register with your RERA credentials and brokerage details for verified agent status.'
  },
  {
    number: '02',
    title: 'Upload Your Listings',
    description: 'Add your properties with photos, details, and investment highlights.'
  },
  {
    number: '03',
    title: 'Investors Discover You',
    description: 'Your listings appear on our platform to thousands of pre-qualified global investors.'
  },
  {
    number: '04',
    title: 'Receive Curated Leads',
    description: 'We match investor inquiries to your properties and forward qualified opportunities.'
  }
];

const stats = [
  { value: '5,000+', label: 'Active Investors' },
  { value: '$2M+', label: 'Average Budget' },
  { value: '50+', label: 'Countries Represented' },
  { value: '24hrs', label: 'Lead Response Time' }
];

export default function AgentPortalLanding() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Agent Portal | List Your Dubai Properties Free"
        description="Join Dubai Wealth Hub's agent network. List your properties to verified global investors. Free exposure, curated lead matching, zero fees."
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container-luxury py-4 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/agent-portal/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/agent-portal/register">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <BadgeCheck className="h-4 w-4" />
                RERA-Verified Agent Network
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground mb-6 leading-tight">
                List Your Properties to{' '}
                <span className="text-primary">Verified Dubai Investors</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Free exposure to our community of pre-qualified global investors. 
                We curate leads based on investor criteria — quality over quantity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/agent-portal/register">
                  <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/agent-portal/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border bg-card">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and designed to connect you with serious investors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-card border-border hover:border-primary/50 transition-colors">
                  <span className="text-4xl font-serif font-bold text-primary/20 mb-4 block">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary/30">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Why Dubai Wealth Hub?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're not just another listing site. We're a curated investment platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-card border-border">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20">
        <div className="container-luxury">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                Connected to Dubai's Premier Network
              </h2>
              <p className="text-muted-foreground mb-8">
                Our founder comes from Sotheby's International Realty network, bringing 
                established relationships with top-producing agents and a commitment to 
                quality over volume.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'RERA-Compliant Platform',
                  'Verified Agent Profiles',
                  'Investor-Focused Matching',
                  'No Hidden Fees'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container-luxury text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Ready to Reach Global Investors?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our agent network today. List unlimited properties, 
            receive curated leads, and grow your business — all for free.
          </p>
          <Link to="/agent-portal/register">
            <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90">
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container-luxury flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/">
            <BrandLogo size="sm" />
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dubai Wealth Hub by Balcom Privé
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
