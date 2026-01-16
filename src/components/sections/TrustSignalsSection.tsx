import { motion } from "framer-motion";
import { Shield, Award, Users, TrendingUp, CheckCircle2 } from "lucide-react";

const trustLogos = [
  { name: "Emaar", initials: "EM" },
  { name: "DAMAC", initials: "DM" },
  { name: "Meraas", initials: "MR" },
  { name: "Nakheel", initials: "NK" },
  { name: "Dubai Holding", initials: "DH" },
  { name: "Sobha", initials: "SB" },
];

const trustStats = [
  { icon: Users, value: "700+", label: "Verified Properties" },
  { icon: TrendingUp, value: "8.2%", label: "Avg. Rental Yield" },
  { icon: Award, value: "100+", label: "Expert Lessons" },
  { icon: Shield, value: "DLD", label: "Verified Data" },
];

const trustFeatures = [
  "Data sourced from Dubai Land Department",
  "Real-time market pricing updates",
  "RERA-registered agent network",
  "Verified developer partnerships",
];

export function TrustSignalsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary via-secondary/95 to-secondary border-y border-primary/10">
      <div className="container-luxury">
        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {trustStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-serif text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Developer Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Featuring Projects From Leading Developers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-card border border-border flex items-center justify-center text-lg md:text-xl font-serif text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10">
                  {logo.initials}
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {logo.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8"
        >
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}