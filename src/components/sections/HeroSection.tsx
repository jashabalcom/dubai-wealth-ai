import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dubai-skyline.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Dubai skyline at golden hour"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/50 to-secondary" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-px h-40 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        <div className="absolute top-1/3 right-10 w-px h-60 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 container-luxury text-center pt-32 pb-24 md:pt-40 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <span className="h-px w-12 bg-primary" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans">
                AI-Powered Wealth Platform
              </span>
              <span className="h-px w-12 bg-primary" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-secondary-foreground leading-[1.1] mb-8"
            >
              Build Wealth Through
              <br />
              <span className="text-gradient-gold">Dubai Real Estate</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-12 font-sans leading-relaxed"
            >
              Join global investors mastering Dubai real estate with AI-powered analysis,
              exclusive education, and priority access to off-plan opportunities.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate('/join')}
              >
                Start Your Journey
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="group"
                onClick={() => setVideoOpen(true)}
              >
                <Play size={18} className="mr-2" />
                Watch Overview
              </Button>
            </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20 pt-12 border-t border-primary/10"
          >
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif text-primary mb-1">$2.4B+</div>
                <div className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/50">
                  Investment Analyzed
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-primary/20" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif text-primary mb-1">12,000+</div>
                <div className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/50">
                  Global Investors
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-primary/20" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif text-primary mb-1">47</div>
                <div className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/50">
                  Countries
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border border-primary/40 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
      </section>

      {/* Video Modal */}
      {videoOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-8 max-w-2xl w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              <div className="text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-2" />
                <p>Platform overview video coming soon</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setVideoOpen(false)}>
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
}
