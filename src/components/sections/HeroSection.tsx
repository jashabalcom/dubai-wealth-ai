import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountUp, useInView } from "@/hooks/useCountUp";
import { useTranslation } from "react-i18next";
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
  const [videoOpen, setVideoOpen] = useState(false);
  const { ref: statsRef, hasBeenInView } = useInView();
  
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
    <>
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
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <span className="h-px w-12 bg-primary" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans">
                {t('hero.badge')}
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
              {t('hero.title')}
              <br />
              <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-secondary-foreground/70 max-w-2xl mx-auto mb-12 font-sans leading-relaxed"
            >
              {t('hero.subtitle')}
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
                {t('hero.cta')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform rtl:mr-2 rtl:ml-0 rtl:group-hover:-translate-x-1" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="group"
                onClick={() => setVideoOpen(true)}
              >
                <Play size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                {t('hero.watchOverview')}
              </Button>
            </motion.div>

          {/* Trust Indicators with Count-Up Animation */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20 pt-12 border-t border-primary/10"
          >
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <CountUpStat 
                end={850} 
                prefix="$" 
                suffix="M+" 
                decimals={0}
                label={t('hero.stats.investment')}
                enabled={hasBeenInView}
              />
              <div className="hidden md:block w-px h-12 bg-primary/20" />
              <CountUpStat 
                end={2500} 
                suffix="+"
                label={t('hero.stats.investors')}
                enabled={hasBeenInView}
              />
              <div className="hidden md:block w-px h-12 bg-primary/20" />
              <CountUpStat 
                end={35}
                label={t('hero.stats.countries')}
                enabled={hasBeenInView}
              />
            </div>
            <p className="text-xs text-muted-foreground/50 mt-4 text-center">
              {t('hero.stats.disclaimer')}
            </p>
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
                <p>{t('hero.videoComingSoon')}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setVideoOpen(false)}>
              {t('common.close')}
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
}
