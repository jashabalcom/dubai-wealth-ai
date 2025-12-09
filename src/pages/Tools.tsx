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
  ArrowLeftRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InvestmentDisclaimer } from '@/components/ui/disclaimers';

const tools = [
  {
    id: 'roi',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for Dubai properties including rental yield, capital appreciation, and total returns.',
    icon: TrendingUp,
    color: 'emerald',
    href: '/tools/roi',
  },
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Estimate monthly payments, total interest, and amortization schedule for your property purchase.',
    icon: Home,
    color: 'blue',
    href: '/tools/mortgage',
  },
  {
    id: 'rent-vs-buy',
    title: 'Rent vs Buy Calculator',
    description: 'Compare the long-term financial implications of renting versus buying a property in Dubai.',
    icon: Building2,
    color: 'purple',
    href: '/tools/rent-vs-buy',
  },
  {
    id: 'airbnb',
    title: 'Airbnb Yield Calculator',
    description: 'Estimate short-term rental income potential based on location, occupancy rates, and seasonal pricing.',
    icon: Calendar,
    color: 'orange',
    href: '/tools/airbnb',
  },
  {
    id: 'str-vs-ltr',
    title: 'STR vs LTR Comparison',
    description: 'Compare short-term (Airbnb) vs long-term rental strategies with detailed yield analysis.',
    icon: ArrowLeftRight,
    color: 'pink',
    href: '/tools/str-vs-ltr',
  },
  {
    id: 'total-cost',
    title: 'Total Cost of Ownership',
    description: 'See the complete financial picture including all acquisition, ongoing, and exit costs over your investment timeline.',
    icon: Wallet,
    color: 'teal',
    href: '/tools/total-cost',
  },
  {
    id: 'golden-visa',
    title: 'Golden Visa Wizard',
    description: 'Get AI-powered personalized guidance for your UAE Golden Visa eligibility and investment recommendations.',
    icon: Award,
    color: 'gold',
    href: '/golden-visa',
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
};

export default function Tools() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-dark to-background">
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
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Investment <span className="text-gradient-gold">Tools</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Powerful calculators to analyze Dubai real estate investments with real-time currency conversion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => {
              const colors = colorClasses[tool.color];
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
                >
                  <Link
                    to={tool.href}
                    className="group block h-full"
                  >
                    <div className={`h-full p-8 rounded-2xl bg-card border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-2xl ${colors.glow}`}>
                      <motion.div 
                        className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-6`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <tool.icon className={`w-7 h-7 ${colors.text}`} />
                      </motion.div>

                      <h2 className={`font-heading text-2xl text-foreground mb-3 group-hover:${colors.text} transition-colors`}>
                        {tool.title}
                      </h2>

                      <p className="text-muted-foreground mb-6">
                        {tool.description}
                      </p>

                      <div className={`flex items-center gap-2 ${colors.text}`}>
                        <span className="text-sm font-medium">Open Calculator</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
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
