import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail, CheckCircle2, BookOpen, TrendingUp, Shield } from "lucide-react";
import { useEmailSubscribe } from "@/hooks/useEmailSubscribe";

export function EmailCaptureSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { subscribe, isLoading } = useEmailSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const success = await subscribe(email, {
      source: "hero_lead_magnet",
      leadMagnet: "dubai_investment_guide_2025",
    });

    if (success) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  const benefits = [
    { icon: BookOpen, text: "2025 Market Analysis" },
    { icon: TrendingUp, text: "Top 10 Investment Areas" },
    { icon: Shield, text: "Due Diligence Checklist" },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/95 to-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      
      <div className="relative container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Free Download</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-secondary-foreground mb-6">
            The Dubai Investment Guide
            <span className="text-gradient-gold"> 2025</span>
          </h2>

          <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto mb-8">
            Everything you need to make an informed investment decision in Dubai real estate. 
            Market trends, area analysis, and expert insights.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-2 text-secondary-foreground/80"
              >
                <benefit.icon className="w-5 h-5 text-primary" />
                <span className="text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          {!isSubmitted ? (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="h-12"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Get Free Guide"}
                <Download className="ml-2 w-4 h-4" />
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-6 rounded-xl bg-primary/10 border border-primary/20 max-w-md mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-secondary-foreground mb-1">
                  Check Your Inbox!
                </h3>
                <p className="text-sm text-secondary-foreground/70">
                  We've sent the guide to your email. Check your spam folder if you don't see it.
                </p>
              </div>
            </motion.div>
          )}

          <p className="text-xs text-muted-foreground/50 mt-6">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
