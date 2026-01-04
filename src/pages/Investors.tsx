import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Users, Globe, Briefcase, Shield, Zap, 
  ArrowRight, CheckCircle2, Building2, GraduationCap, 
  Calculator, MessageSquare, Target, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Investors() {
  const keyMetrics = [
    { label: 'Properties Listed', value: '900+', icon: Building2 },
    { label: 'Investment Tools', value: '11', icon: Calculator },
    { label: 'Academy Lessons', value: '50+', icon: GraduationCap },
    { label: 'Neighborhoods', value: '100+', icon: Globe },
  ];

  const investmentHighlights = [
    {
      title: 'Massive Market Opportunity',
      description: 'Dubai\'s $30B+ real estate market with 30%+ foreign buyers seeking digital-first solutions.',
      icon: Globe,
    },
    {
      title: 'Multiple Revenue Streams',
      description: 'B2C subscriptions ($29-$149/mo) + B2B agent portal ($99-$299/mo) + potential transaction fees.',
      icon: DollarSign,
    },
    {
      title: 'AI-Powered Moat',
      description: 'Proprietary AI tools for investment analysis create defensible competitive advantage.',
      icon: Zap,
    },
    {
      title: 'Capital Efficient Model',
      description: 'Software margins with low CAC through content marketing and SEO-driven acquisition.',
      icon: Target,
    },
  ];

  const productSuite = [
    {
      name: 'Property Intelligence',
      description: 'AI-powered analysis, investment scoring, and market data for 900+ Dubai properties.',
      features: ['Investment Score Algorithm', 'True Cost Calculator', 'AI Property Analysis'],
    },
    {
      name: 'Investment Academy',
      description: 'Comprehensive education platform with 50+ lessons on Dubai real estate investing.',
      features: ['Video Courses', 'Progress Tracking', 'Downloadable Resources'],
    },
    {
      name: 'Calculator Suite',
      description: '11 professional-grade investment calculators trusted by serious investors.',
      features: ['ROI Calculator', 'Mortgage Calculator', 'Airbnb Yield Estimator'],
    },
    {
      name: 'Investor Community',
      description: 'Private network connecting global investors with local experts and peers.',
      features: ['Member Directory', 'Direct Messaging', 'Expert Q&A'],
    },
  ];

  return (
    <>
      <SEOHead 
        title="Investor Relations | Dubai Wealth Hub"
        description="Learn about Dubai Wealth Hub's investment opportunity. Leading PropTech platform for Dubai real estate investors."
        noIndex={true}
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge className="mb-6 bg-gold/20 text-gold border-gold/30">
                Investment Opportunity
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                The Definitive Platform for{' '}
                <span className="text-gold">Dubai Real Estate</span> Investors
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Dubai Real Estate Investor is building the Bloomberg Terminal for Dubai real estate — 
                combining data intelligence, education, and community for global investors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-primary-foreground">
                  <a href="mailto:invest@dubairealestateinvestor.com">Request Pitch Deck</a>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Link to="/contact">Schedule a Call</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {keyMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <metric.icon className="h-8 w-8 mx-auto mb-3 text-gold" />
                  <p className="text-3xl font-bold text-gold mb-1">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Thesis */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Investment Thesis</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Why Dubai Wealth Hub represents a compelling investment opportunity
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {investmentHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-gold/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold/10 rounded-lg">
                          <highlight.icon className="h-5 w-5 text-gold" />
                        </div>
                        <CardTitle className="text-lg">{highlight.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{highlight.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Suite */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Product Suite</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A vertically integrated platform addressing every stage of the investor journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {productSuite.map((product, index) => (
                <Card key={product.name} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gold/5 to-transparent">
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <ul className="space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-gold" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Market Opportunity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-2xl bg-gradient-to-b from-gold/10 to-transparent border border-gold/20">
                  <p className="text-4xl font-bold text-gold mb-2">$30B+</p>
                  <p className="text-muted-foreground">Dubai Real Estate Market</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <p className="text-4xl font-bold text-emerald-500 mb-2">30%+</p>
                  <p className="text-muted-foreground">Foreign Buyers</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                  <p className="text-4xl font-bold text-blue-500 mb-2">15%</p>
                  <p className="text-muted-foreground">PropTech CAGR</p>
                </div>
              </div>
              
              <div className="mt-12 p-8 rounded-2xl bg-card border border-border">
                <h3 className="text-xl font-semibold mb-4">Why Now?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <span><strong>Golden Visa Program</strong> — 10-year residency visas driving foreign investment surge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <span><strong>Expo 2020 Legacy</strong> — Infrastructure investments creating lasting value</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <span><strong>Digital-First Buyers</strong> — Younger investors demand modern PropTech solutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <span><strong>Tax Advantages</strong> — 0% income tax attracting global wealth</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gold/10 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Journey
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              We're raising capital to accelerate growth, expand our product suite, and dominate 
              the Dubai PropTech market. Let's talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-primary-foreground">
                <a href="mailto:invest@dubairealestateinvestor.com">invest@dubairealestateinvestor.com</a>
              </Button>
              <Button variant="outline" size="lg">
                <Link to="/contact">Schedule Introduction</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
