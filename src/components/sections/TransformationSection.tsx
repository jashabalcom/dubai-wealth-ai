import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";

const transformations = [
  {
    before: "Overwhelmed by conflicting information",
    after: "Clear understanding of what works in Dubai",
  },
  {
    before: "Afraid of making an expensive mistake",
    after: "Confident in your investment decisions",
  },
  {
    before: "Don't know which developers to trust",
    after: "Know exactly who's reliable and why",
  },
  {
    before: "Confused about Golden Visa requirements",
    after: "Clear pathway to residency through investment",
  },
  {
    before: "No one to ask when you have questions",
    after: "Community of investors + expert support",
  },
  {
    before: "Analysis paralysis on every property",
    after: "Simple frameworks to evaluate any deal",
  },
];

export function TransformationSection() {
  return (
    <section id="transformation" className="section-padding bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container-luxury relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
            Your Transformation
          </span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            From Hesitation
            <br />
            <span className="text-gradient-gold">to Confident Action</span>
          </h2>
          <p className="text-secondary-foreground/60 text-lg">
            This is the journey our members take. Where are you starting from?
          </p>
        </motion.div>

        {/* Transformation Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Before Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                <X className="w-4 h-4" />
                Before You Join
              </span>
            </div>
            {transformations.map((item, index) => (
              <motion.div
                key={`before-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-4 rounded-xl bg-secondary-foreground/5 border border-secondary-foreground/10"
              >
                <p className="text-secondary-foreground/70 text-sm md:text-base">
                  {item.before}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* After Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
                <Check className="w-4 h-4" />
                After You Join
              </span>
            </div>
            {transformations.map((item, index) => (
              <motion.div
                key={`after-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <p className="text-secondary-foreground text-sm md:text-base font-medium">
                  {item.after}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Arrow indicator for mobile */}
        <div className="flex justify-center my-8 md:hidden">
          <ArrowRight className="w-8 h-8 text-primary rotate-90" />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-secondary-foreground/60 text-lg mb-2">
            Ready to make the shift?
          </p>
          <p className="text-primary font-serif text-xl">
            Start your free journey today →
          </p>
        </motion.div>
      </div>
    </section>
  );
}