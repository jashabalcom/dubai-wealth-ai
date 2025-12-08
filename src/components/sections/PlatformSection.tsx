import { motion } from "framer-motion";
import { GraduationCap, Bot, BarChart3, Building, Users, FileText } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Dubai Real Estate Academy",
    description:
      "Master Dubai investing with expert-led courses covering fundamentals, off-plan strategies, short-term rentals, and Golden Visa pathways.",
    highlight: "50+ Premium Lessons",
  },
  {
    icon: Bot,
    title: "AI Investment Assistant",
    description:
      "Get personalized investment strategies, property analysis, and market insights powered by advanced AI trained on Dubai real estate data.",
    highlight: "24/7 Smart Guidance",
  },
  {
    icon: BarChart3,
    title: "Investment Tools Suite",
    description:
      "ROI calculators, mortgage planners, rental yield analyzers, and off-plan cash flow projections to make data-driven decisions.",
    highlight: "5 Powerful Tools",
  },
  {
    icon: Building,
    title: "Property & Off-Plan Hub",
    description:
      "Browse curated listings, compare off-plan projects, and get early access to exclusive launches from top Dubai developers.",
    highlight: "Priority Access",
  },
  {
    icon: Users,
    title: "Investor Community",
    description:
      "Connect with global investors, share insights, discuss deals, and access elite networking opportunities with like-minded wealth builders.",
    highlight: "12,000+ Members",
  },
  {
    icon: FileText,
    title: "Market Intelligence",
    description:
      "Weekly market reports, developer updates, regulatory changes, and exclusive insights from our Dubai-based research team.",
    highlight: "Weekly Reports",
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="section-padding bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

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
            The Platform
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
            Everything You Need to
            <br />
            <span className="text-gradient-gold">Invest with Confidence</span>
          </h2>
          <p className="text-secondary-foreground/70 text-lg leading-relaxed">
            A complete ecosystem combining education, AI-powered tools, exclusive deal flow,
            and a global community of successful investors.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:border-primary/30 hover:bg-secondary-foreground/10 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-serif text-secondary-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                <div className="inline-flex items-center text-xs uppercase tracking-[0.1em] text-primary font-sans">
                  {feature.highlight}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20"
        >
          <div className="relative rounded-2xl overflow-hidden border border-secondary-foreground/10 bg-secondary-foreground/5">
            <div className="aspect-[16/9] bg-gradient-to-br from-secondary via-navy-light to-secondary flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <p className="text-secondary-foreground/60 text-sm uppercase tracking-[0.2em]">
                  Platform Preview Coming Soon
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
