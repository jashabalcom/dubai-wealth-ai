import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, GraduationCap, Calculator, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountUp, useInView } from "@/hooks/useCountUp";
import { useTranslation } from "react-i18next";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import heroImage from "@/assets/hero-dubai-skyline.jpg";

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
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-3xl md:text-4xl font-serif text-primary mb-1 stat-glow">
        {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </div>
      <div className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/50">
        {label}
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: statsRef, hasBeenInView } = useInView();
  const { data: stats } = usePlatformStats();
  
  // Parallax setup
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms - different speeds create depth
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const decorativeLeftY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const decorativeRightY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <motion.img
          src={heroImage}
          alt="Dubai skyline at golden hour"
          className="w-full h-[120%] object-cover"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/50 to-secondary" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60" />
      </motion.div>

      {/* Decorative Elements with Parallax */}
      <motion.div 
        className="absolute top-1/4 left-10 w-px h-40 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
        style={{ y: decorativeLeftY }}
      />
      <motion.div 
        className="absolute top-1/3 right-10 w-px h-60 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        style={{ y: decorativeRightY }}
      />

      {/* Content with subtle parallax */}
      <motion.div 
        className="relative z-10 container-luxury text-center pt-32 pb-24 md:pt-40 md:pb-32"
        style={{ y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          {/* Tagline - Updated to advisory tone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="h-px w-12 bg-primary" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans">
              Intelligence & Access for Global Investors
            </span>
            <span className="h-px w-12 bg-primary" />
          </motion.div>

          {/* Main Headline - Authority-first */}
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

          {/* Subheadline - Advisory, not salesy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-12 font-sans leading-relaxed"
          >
            Market intelligence, curated opportunities, and expert education for 
            investors who approach Dubai real estate with intention.
          </motion.p>

          {/* Single Primary CTA - Cleaner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate('/auth')}
            >
              Access the Platform
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform rtl:mr-2 rtl:ml-0 rtl:group-hover:-translate-x-1" />
            </Button>
          </motion.div>

        {/* Platform Stats with Count-Up Animation */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 pt-12 border-t border-primary/10"
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
      </motion.div>
    </motion.div>

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
  );
}
