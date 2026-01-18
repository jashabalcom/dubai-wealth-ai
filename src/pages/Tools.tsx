import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Home, 
  TrendingUp, 
  Building2,
  ArrowRight,
  Percent,
  DollarSign,
  Calendar,
  Award,
  Wallet,
  ArrowLeftRight,
  MessageSquare,
  Sparkles,
  Landmark,
  FileSpreadsheet,
  Scale,
  MapPin,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';
import { SEOHead } from '@/components/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { PAGE_SEO } from '@/lib/seo-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// FAQ data for structured data
const toolsFAQs = [
  {
    question: "What investment calculators are available for Dubai real estate?",
    answer: "We offer 13+ calculators including ROI Calculator, Mortgage Calculator, Rent vs Buy, Airbnb Yield Calculator, Off-Plan Payment Calculator, Total Cost of Ownership, Cap Rate & NOI Calculator, DSCR Calculator, and Golden Visa Wizard.",
  },
  {
    question: "Are the Dubai real estate calculators free to use?",
    answer: "Yes, the Mortgage Calculator and Rent vs Buy Calculator are completely free. Other calculators offer 2 free uses, with unlimited access for Investor tier members and above.",
  },
  {
    question: "Do the calculators use real Dubai market data?",
    answer: "Yes, all calculators are pre-configured with Dubai-specific data including DLD fees (4%), agent commissions, typical service charges, and current market benchmarks from the Dubai Land Department.",
  },
  {
    question: "Can I calculate returns in my local currency?",
    answer: "Yes, all tools support real-time currency conversion to USD, EUR, GBP, INR, CNY, and 5 other major currencies with live exchange rates.",
  },
];

const residentialTools = [
  {
    id: 'ai-assistant',
    title: 'AI Investment Assistant',
    description: 'Get personalized investment advice, market insights, and strategy recommendations powered by AI.',
    icon: MessageSquare,
    color: 'gold',
    href: '/ai',
    featured: true,
    freeUses: 0, // AI has different limits
  },
  {
    id: 'roi',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for Dubai properties including rental yield, capital appreciation, and total returns.',
    icon: TrendingUp,
    color: 'emerald',
    href: '/tools/roi',
    freeUses: 2,
  },
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Estimate monthly payments, total interest, and amortization schedule for your property purchase.',
    icon: Home,
    color: 'blue',
    href: '/tools/mortgage',
    freeUses: 0, // Completely free
    isFree: true,
  },
  {
    id: 'rent-vs-buy',
    title: 'Rent vs Buy Calculator',
    description: 'Compare the long-term financial implications of renting versus buying a property in Dubai.',
    icon: Building2,
    color: 'purple',
    href: '/tools/rent-vs-buy',
    freeUses: 0, // Completely free
    isFree: true,
  },
  {
    id: 'airbnb',
    title: 'Airbnb Yield Calculator',
    description: 'Estimate short-term rental income potential based on location, occupancy rates, and seasonal pricing.',
    icon: Calendar,
    color: 'orange',
    href: '/tools/airbnb',
    freeUses: 2,
  },
  {
    id: 'str-vs-ltr',
    title: 'STR vs LTR Comparison',
    description: 'Compare short-term (Airbnb) vs long-term rental strategies with detailed yield analysis.',
    icon: ArrowLeftRight,
    color: 'pink',
    href: '/tools/str-vs-ltr',
    freeUses: 0,
    eliteOnly: true,
  },
  {
    id: 'total-cost',
    title: 'Total Cost of Ownership',
    description: 'See the complete financial picture including all acquisition, ongoing, and exit costs over your investment timeline.',
    icon: Wallet,
    color: 'teal',
    href: '/tools/total-cost',
    freeUses: 2,
    pdfExport: true,
  },
  {
    id: 'offplan',
    title: 'Off-Plan Payment Calculator',
    description: 'Compare 20/80, 40/60, post-handover payment plans with Oqood fees and cash flow timeline.',
    icon: Building2,
    color: 'purple',
    href: '/tools/offplan',
    featured: true,
    freeUses: 2,
  },
  {
    id: 'golden-visa',
    title: 'Golden Visa Wizard',
    description: 'Get AI-powered personalized guidance for your UAE Golden Visa eligibility and investment recommendations.',
    icon: Award,
    color: 'gold',
    href: '/golden-visa',
    freeUses: 0, // Special tool
  },
];

const commercialTools = [
  {
    id: 'cap-rate',
    title: 'Cap Rate & NOI Calculator',
    description: 'Calculate capitalization rate, net operating income, and analyze commercial property investments with Dubai market benchmarks.',
    icon: Landmark,
    color: 'slate',
    href: '/tools/cap-rate',
    freeUses: 2,
  },
  {
    id: 'dscr',
    title: 'DSCR Calculator',
    description: 'Calculate Debt Service Coverage Ratio for commercial financing, determine max loan amounts, and assess lender requirements.',
    icon: Scale,
    color: 'slate',
    href: '/tools/dscr',
    freeUses: 2,
  },
  {
    id: 'lease-analyzer',
    title: 'Commercial Lease Analyzer',
    description: 'Analyze lease terms, calculate effective rent with escalations, CAM, and rent-free periods over the lease term.',
    icon: FileSpreadsheet,
    color: 'slate',
    href: '/tools/lease-analyzer',
    freeUses: 0,
    eliteOnly: true,
  },
  {
    id: 'free-zone',
    title: 'Free Zone Comparison',
    description: 'Compare Dubai free zones side-by-side: DMCC, DIFC, JAFZA, DAFZA and more with setup costs, visa allocation, and sector fit.',
    icon: MapPin,
    color: 'slate',
    href: '/tools/free-zone',
    freeUses: 2,
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-500',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500',
    glow: 'group-hover:shadow-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-500',
    glow: 'group-hover:shadow-purple-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  teal: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    text: 'text-teal-500',
    glow: 'group-hover:shadow-teal-500/20',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-500',
    glow: 'group-hover:shadow-pink-500/20',
  },
  gold: {
    bg: 'bg-gold/10',
    border: 'border-gold/20',
    text: 'text-gold',
    glow: 'group-hover:shadow-gold/20',
  },
  slate: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-600',
    glow: 'group-hover:shadow-slate-500/20',
  },
};

export default function Tools() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead {...PAGE_SEO.tools} />
      <FAQSchema faqs={toolsFAQs} />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-secondary-foreground mb-4">
              Investment <span className="text-gradient-gold">Tools</span>
            </h1>
            <p className="text-lg text-secondary-foreground/70">
              Powerful calculators to analyze Dubai real estate investments with real-time currency conversion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Residential Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-2">Residential & Investment</h2>
            <p className="text-muted-foreground">Analyze residential properties and investment opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {residentialTools.map((tool, index) => {
              const colors = colorClasses[tool.color];
              const isFeatured = 'featured' in tool && tool.featured;
              const hasPdfExport = 'pdfExport' in tool && tool.pdfExport;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className={isFeatured ? 'md:col-span-2' : ''}
                >
                  <Link
                    to={tool.href}
                    className="group block h-full"
                  >
                    <div className={cn(
                      "h-full p-4 sm:p-6 md:p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-2xl",
                      isFeatured 
                        ? "border-gold/30 bg-gradient-to-r from-gold/5 to-transparent hover:border-gold/50" 
                        : "border-border hover:border-gold/30",
                      colors.glow
                    )}>
                      <div className="flex items-start gap-3 sm:gap-6">
                        <motion.div 
                          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <tool.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colors.text}`} />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            <h3 className="font-heading text-lg sm:text-2xl text-foreground group-hover:text-gold transition-colors">
                              {tool.title}
                            </h3>
                            {isFeatured && (
                              <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] sm:text-xs">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                Featured
                              </Badge>
                            )}
                            {'isFree' in tool && tool.isFree && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                Free
                              </Badge>
                            )}
                            {'eliteOnly' in tool && tool.eliteOnly && (
                              <Badge className="text-[10px] sm:text-xs bg-gold/10 text-gold border-gold/30">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                Elite+
                              </Badge>
                            )}
                            {tool.freeUses > 0 && !('isFree' in tool) && !('eliteOnly' in tool) && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs bg-muted/50 text-muted-foreground">
                                {tool.freeUses} Free
                              </Badge>
                            )}
                            {hasPdfExport && (
                              <Badge className="text-[10px] sm:text-xs bg-gold/10 text-gold border-gold/30">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                PDF (Elite+)
                              </Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                            {tool.description}
                          </p>

                          <div className={`flex items-center gap-2 ${colors.text}`}>
                            <span className="text-xs sm:text-sm font-medium">{isFeatured ? 'Start Chat' : 'Open Calculator'}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commercial Tools Grid */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-heading text-2xl md:text-3xl text-foreground">Commercial Real Estate</h2>
              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                New
              </Badge>
            </div>
            <p className="text-muted-foreground">Specialized tools for office, retail, warehouse, and industrial investments</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commercialTools.map((tool, index) => {
              const colors = colorClasses[tool.color];
              const isComingSoon = 'comingSoon' in tool && tool.comingSoon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  whileHover={!isComingSoon ? { 
                    y: -8,
                    transition: { duration: 0.2 }
                  } : undefined}
                >
                  {isComingSoon ? (
                    <div className="group block h-full cursor-not-allowed opacity-60">
                      <div className={cn(
                        "h-full p-6 md:p-8 rounded-2xl bg-card border border-border",
                      )}>
                        <div className="flex items-start gap-6">
                          <div 
                            className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                          >
                            <tool.icon className={`w-7 h-7 ${colors.text}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-heading text-2xl text-foreground">
                                {tool.title}
                              </h3>
                              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                                Coming Soon
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-4">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={tool.href}
                      className="group block h-full"
                    >
                      <div className={cn(
                        "h-full p-4 sm:p-6 md:p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-2xl border-border hover:border-slate-500/30",
                        colors.glow
                      )}>
                        <div className="flex items-start gap-3 sm:gap-6">
                          <motion.div 
                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <tool.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colors.text}`} />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            <h3 className="font-heading text-lg sm:text-2xl text-foreground group-hover:text-slate-600 transition-colors">
                              {tool.title}
                            </h3>
                              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-[10px] sm:text-xs">
                                Commercial
                              </Badge>
                              {'eliteOnly' in tool && tool.eliteOnly && (
                                <Badge className="text-[10px] sm:text-xs bg-gold/10 text-gold border-gold/30">
                                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                  Elite+
                                </Badge>
                              )}
                              {tool.freeUses > 0 && !('eliteOnly' in tool) && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-muted/50 text-muted-foreground">
                                  {tool.freeUses} Free
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                              {tool.description}
                            </p>

                            <div className={`flex items-center gap-2 ${colors.text}`}>
                              <span className="text-xs sm:text-sm font-medium">Open Calculator</span>
                              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
              All Tools Include
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: DollarSign,
                title: 'Real-Time Currency',
                description: 'Convert results to USD, EUR, GBP, and 7 more currencies with live exchange rates.',
              },
              {
                icon: Percent,
                title: 'Dubai-Specific Data',
                description: 'Pre-configured with Dubai market rates, fees, and typical scenarios.',
              },
              {
                icon: TrendingUp,
                title: 'Visual Charts',
                description: 'Clear visualizations to understand your investment returns at a glance.',
              },
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-heading text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <InvestmentDisclaimer />
        </div>
      </section>

      <Footer />
    </div>
  );
}