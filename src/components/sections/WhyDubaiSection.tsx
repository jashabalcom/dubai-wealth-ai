import { motion } from "framer-motion";
import { TrendingUp, Shield, Globe2, Building2, Coins, Plane } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "8-12%",
    label: "Average Rental Yield",
    description: "Outperforming London, NYC & Singapore",
  },
  {
    icon: Shield,
    value: "0%",
    label: "Income & Capital Gains Tax",
    description: "Keep 100% of your returns",
  },
  {
    icon: Globe2,
    value: "#1",
    label: "Global Destination",
    description: "For ultra-high-net-worth individuals",
  },
  {
    icon: Building2,
    value: "$82B",
    label: "Annual Transactions",
    description: "Record-breaking market growth",
  },
  {
    icon: Coins,
    value: "10-Year",
    label: "Golden Visa",
    description: "Full residency for investors",
  },
  {
    icon: Plane,
    value: "4 Hours",
    label: "To 3 Billion People",
    description: "Strategic global location",
  },
];

export function WhyDubaiSection() {
  return (
    <section id="why-dubai" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
      
      <div className="container-luxury relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
            The Opportunity
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
            Why Global Investors
            <br />
            <span className="text-gradient-gold">Choose Dubai</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Dubai has emerged as the world's premier real estate investment destination,
            offering unparalleled returns, tax advantages, and lifestyle benefits.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="card-luxury h-full hover:border-primary/30 border border-transparent">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-serif text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-foreground mb-2">
                      {stat.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Ready to tap into the world's most dynamic property market?
          </p>
          <a
            href="#membership"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-sans text-sm uppercase tracking-[0.1em]"
          >
            Explore Membership Options
            <span className="text-lg">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
