import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";
import { Button } from "@/components/ui/button";

const features = [
  { icon: LineChart, text: "Track your investment portfolio" },
  { icon: Sparkles, text: "AI-powered market insights" },
  { icon: Shield, text: "Curated property opportunities" },
  { icon: Zap, text: "Real-time market intelligence" },
];

export function DashboardPreviewSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Member Dashboard
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Your Personal{" "}
            <span className="text-primary">Investment Command Center</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to make smarter Dubai real estate investments — all in one beautifully designed dashboard.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/auth">
              <Button size="lg" className="group">
                Get Access Now
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10, rotateY: -5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 5, rotateY: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ 
              scale: 1.02, 
              rotateX: 0, 
              rotateY: 0,
              transition: { duration: 0.3 } 
            }}
            className="order-1 lg:order-2"
            style={{ perspective: "1000px" }}
          >
            <div className="relative">
              {/* Glow effect behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-2xl rounded-3xl opacity-60" />
              
              {/* Mockup container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
                {/* Browser bar */}
                <div className="bg-[#1a1a2e] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white/5 text-[10px] text-white/40 font-mono">
                      dubaiwealthbuilder.com/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <DashboardMockup />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg"
              >
                ✨ Elite Access
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
