import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Dubai Wealth Hub transformed how I approach real estate investing. The AI assistant alone saved me months of research and helped me find my first off-plan property.",
    author: "Marcus Chen",
    role: "Tech Entrepreneur",
    location: "Singapore",
    avatar: "MC",
  },
  {
    quote:
      "The Academy courses gave me the confidence to invest $500K in Dubai Marina. Within 18 months, I'm seeing 9.2% rental yields. This platform is a game-changer.",
    author: "Sarah Al-Rashid",
    role: "Investment Banker",
    location: "London, UK",
    avatar: "SA",
  },
  {
    quote:
      "As an Elite member, I got early access to a new developer launch and secured units before the public release. The priority allocations alone are worth 10x the membership.",
    author: "James Patterson",
    role: "Portfolio Manager",
    location: "New York, USA",
    avatar: "JP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

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
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
            Trusted by Global
            <br />
            <span className="text-gradient-gold">Wealth Builders</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="h-full p-8 rounded-2xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:border-primary/20 transition-colors">
                <Quote className="w-10 h-10 text-primary/30 mb-6" />
                
                <p className="text-secondary-foreground/80 text-lg leading-relaxed mb-8 font-serif italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-secondary-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-secondary-foreground/60">
                      {testimonial.role} · {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
