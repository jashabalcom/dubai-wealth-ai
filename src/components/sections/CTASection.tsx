import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, loading } = useSubscription();

  const handleGetStarted = async () => {
    if (!user) {
      sessionStorage.setItem('pending_checkout_tier', 'investor');
      navigate('/auth');
      return;
    }
    await startCheckout('investor');
  };

  const handleScheduleCall = () => {
    navigate('/contact');
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container-luxury relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 leading-tight">
            Start Building Your
            <br />
            <span className="text-gradient-gold">Dubai Portfolio Today</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Join a growing community of smart property investors building wealth 
            through Dubai's unprecedented opportunities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
            <Button 
              variant="default" 
              size="xl" 
              className="group"
              onClick={() => navigate('/auth')}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Start Free Today'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={handleScheduleCall}
            >
              Schedule a Call
            </Button>
          </div>

          {/* Trust badges */}
          <p className="text-muted-foreground/60 text-sm mb-6">
            Free forever plan available · No credit card required
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              30-day money-back guarantee
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Secure payment
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
