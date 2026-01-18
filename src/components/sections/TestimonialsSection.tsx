import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    before: "I spent 6 months researching Dubai properties online and felt MORE confused than when I started.",
    after: "Within 3 weeks of joining, I understood the market, knew which areas matched my goals, and closed on my first off-plan unit with total confidence.",
    author: "Marcus Chen",
    role: "Tech Entrepreneur",
    location: "Singapore",
    avatar: "MC",
    rating: 5,
    investment: "First property: $420K in Business Bay · 8.2% yield achieved",
  },
  {
    before: "I was terrified of making a $500K mistake in a market I didn't understand, with agents I couldn't trust.",
    after: "The Academy gave me a framework to evaluate any deal. I now own two properties in Dubai Marina and feel completely in control of my portfolio.",
    author: "Sarah Al-Rashid",
    role: "Investment Banker",
    location: "London, UK",
    avatar: "SA",
    rating: 5,
    investment: "2 properties · 9.2% average yield",
  },
  {
    before: "Every developer promised the moon. I had no way to tell who was legitimate and who was just selling.",
    after: "The Elite community connected me with investors who'd bought from the same developers. I got priority access to a launch and secured units before public release.",
    author: "James Patterson",
    role: "Portfolio Manager",
    location: "New York, USA",
    avatar: "JP",
    rating: 5,
    investment: "3 properties acquired · Golden Visa approved",
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
          <p className="text-secondary-foreground/60 text-lg">
            Join investors from 50+ countries building wealth in Dubai
          </p>
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
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                {/* Before State */}
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-wider text-destructive/70 font-medium">Before:</span>
                  <p className="text-secondary-foreground/60 text-sm italic mt-1">
                    "{testimonial.before}"
                  </p>
                </div>
                
                {/* After State */}
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-emerald-500 font-medium">After:</span>
                  <p className="text-secondary-foreground text-base font-medium mt-1">
                    "{testimonial.after}"
                  </p>
                </div>
                
                {/* Investment Tag */}
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full text-xs text-primary mb-6">
                  {testimonial.investment}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif text-lg group-hover:bg-primary group-hover:text-secondary transition-colors duration-300">
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
