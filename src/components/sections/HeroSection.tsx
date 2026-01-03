import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, GraduationCap, Calculator, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountUp, useInView } from "@/hooks/useCountUp";
import { useTranslation } from "react-i18next";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useMobileOptimizedMotion } from "@/hooks/useReducedMotion";
import heroImageWebp from "@/assets/hero-dubai-skyline.webp";
import heroImageJpg from "@/assets/hero-dubai-skyline.jpg";

interface CountUpStatProps {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  enabled: boolean;
}

function CountUpStat({ end, suffix = "", prefix = "", decimals = 0, label, enabled }: CountUpStatProps) {
  const count = useCountUp({ end, duration: 2500, decimals, enabled });
  
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-serif text-primary mb-1 stat-glow">
        {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </div>
      <div className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/50">
        {label}
      </div>
    </div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: statsRef, hasBeenInView } = useInView();
  const { data: stats } = usePlatformStats();
  const reduceMotion = useMobileOptimizedMotion();
  
  // Defer parallax initialization to after first paint for better Speed Index
  const [parallaxReady, setParallaxReady] = useState(false);
  useEffect(() => {
    // Use requestIdleCallback to defer parallax setup
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setParallaxReady(true), { timeout: 1000 });
    } else {
      const timer = setTimeout(() => setParallaxReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Parallax setup - only active after initial paint
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms - disabled until parallaxReady and on mobile
  const enableParallax = parallaxReady && !reduceMotion;
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", enableParallax ? "30%" : "0%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", enableParallax ? "15%" : "0%"]);
  const decorativeLeftY = useTransform(scrollYProgress, [0, 1], ["0%", enableParallax ? "50%" : "0%"]);
  const decorativeRightY = useTransform(scrollYProgress, [0, 1], ["0%", enableParallax ? "40%" : "0%"]);

  // Simplified animation config - no delay on initial render for faster Speed Index
  const fadeIn = {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0 }
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 will-change-transform"
        style={{ y: reduceMotion ? 0 : backgroundY }}
      >
        <picture>
          <source srcSet={heroImageWebp} type="image/webp" />
          <img
            src={heroImageJpg}
            alt="Dubai skyline at golden hour"
            loading="eager"
            decoding="async"
            className="w-full h-[120%] object-cover"
            style={{ opacity: 0.6 }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/50 to-secondary" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60" />
      </motion.div>

      {/* Decorative Elements with Parallax - Hidden on mobile, deferred */}
      {enableParallax && (
        <>
          <motion.div 
            className="absolute top-1/4 left-10 w-px h-40 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden md:block"
            style={{ y: decorativeLeftY }}
          />
          <motion.div 
            className="absolute top-1/3 right-10 w-px h-60 bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden md:block"
            style={{ y: decorativeRightY }}
          />
        </>
      )}

      {/* Content with subtle parallax */}
      <motion.div 
        className="relative z-10 container-luxury text-center pt-24 pb-16 md:pt-32 md:pb-24 will-change-transform"
        style={{ y: reduceMotion ? 0 : contentY }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Tagline */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: reduceMotion ? 0 : 0.3 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="h-px w-12 bg-primary" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans">
              Smart Dubai Real Estate Investing
            </span>
            <span className="h-px w-12 bg-primary" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: reduceMotion ? 0 : 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-secondary-foreground leading-[1.1] mb-8"
          >
            Build Wealth Through
            <br />
            <span className="text-gradient-gold">Dubai Real Estate</span>
          </motion.h1>

          {/* Subheadline */}
            <motion.p
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: reduceMotion ? 0 : 0.6 }}
            className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-12 font-sans leading-relaxed"
          >
            Education, tools, and market intelligence to help you make confident 
            property decisions — whether you're buying your first home or building a portfolio.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: reduceMotion ? 0 : 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate('/auth')}
            >
              Start Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform rtl:mr-2 rtl:ml-0 rtl:group-hover:-translate-x-1" />
            </Button>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            ref={statsRef}
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: reduceMotion ? 0 : 1.2 }}
            className="mt-12 pt-8 border-t border-primary/10"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <CountUpStat 
                  end={stats?.properties ?? 700} 
                  suffix="+"
                  label="Properties"
                  enabled={hasBeenInView}
                />
              </div>
              <div className="hidden md:block w-px h-10 bg-primary/20" />
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <CountUpStat 
                  end={stats?.lessons ?? 100} 
                  suffix="+"
                  label="Lessons"
                  enabled={hasBeenInView}
                />
              </div>
              <div className="hidden md:block w-px h-10 bg-primary/20" />
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-primary" />
                <CountUpStat 
                  end={stats?.tools ?? 11}
                  label="Tools"
                  enabled={hasBeenInView}
                />
              </div>
              <div className="hidden md:block w-px h-10 bg-primary/20" />
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <CountUpStat 
                  end={stats?.neighborhoods ?? 100} 
                  suffix="+"
                  label="Neighborhoods"
                  enabled={hasBeenInView}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on mobile, deferred */}
      {enableParallax && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border border-primary/40 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}