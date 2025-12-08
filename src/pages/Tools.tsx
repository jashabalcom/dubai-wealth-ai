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
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const tools = [
  {
    id: 'roi',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for Dubai properties including rental yield, capital appreciation, and total returns.',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    href: '/tools/roi',
  },
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Estimate monthly payments, total interest, and amortization schedule for your property purchase.',
    icon: Home,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    href: '/tools/mortgage',
  },
  {
    id: 'rent-vs-buy',
    title: 'Rent vs Buy Calculator',
    description: 'Compare the long-term financial implications of renting versus buying a property in Dubai.',
    icon: Building2,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    href: '/tools/rent-vs-buy',
  },
  {
    id: 'airbnb',
    title: 'Airbnb Yield Calculator',
    description: 'Estimate short-term rental income potential based on location, occupancy rates, and seasonal pricing.',
    icon: Calendar,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    href: '/tools/airbnb',
  },
];

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
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={tool.href}
                  className="group block h-full"
                >
                  <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5">
                    <div className={`w-14 h-14 rounded-xl ${tool.color} border flex items-center justify-center mb-6`}>
                      <tool.icon className="w-7 h-7" />
                    </div>

                    <h2 className="font-heading text-2xl text-foreground mb-3 group-hover:text-gold transition-colors">
                      {tool.title}
                    </h2>

                    <p className="text-muted-foreground mb-6">
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-2 text-gold">
                      <span className="text-sm font-medium">Open Calculator</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">Real-Time Currency</h3>
              <p className="text-sm text-muted-foreground">
                Convert results to USD, EUR, GBP, and 7 more currencies with live exchange rates.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <Percent className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">Dubai-Specific Data</h3>
              <p className="text-sm text-muted-foreground">
                Pre-configured with Dubai market rates, fees, and typical scenarios.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">Visual Charts</h3>
              <p className="text-sm text-muted-foreground">
                Clear visualizations to understand your investment returns at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
