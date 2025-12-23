import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Check, X, Briefcase, LineChart, Shield, Phone, Star, Users, Play, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";
import { PAGE_SEO, generateFAQSchema } from "@/lib/seo-config";

const EliteFunnel = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { startCheckout, loading } = useSubscription();
  const [showVideo, setShowVideo] = useState(false);

  const handleEliteCTA = async () => {
    if (!user) {
      navigate("/auth?redirect=/join-elite");
      return;
    }
    if (profile?.membership_tier === "elite") {
      navigate("/dashboard");
      return;
    }
    await startCheckout("elite");
  };

  const getCTAText = () => {
    if (!user) return "Apply for Elite Access";
    if (profile?.membership_tier === "elite") return "Go to Dashboard";
    if (profile?.membership_tier === "investor") return "Upgrade to Elite";
    return "Go Elite — $97/mo";
  };

  const stats = [
    { value: "$2.4M+", label: "Avg. Elite Portfolio" },
    { value: "47%", label: "Higher Returns" },
    { value: "100", label: "Elite Spots/Month" },
    { value: "24/7", label: "Priority Support" },
  ];

  const comparisonFeatures = [
    { feature: "Academy Courses Access", investor: true, elite: true },
    { feature: "Basic Investment Tools", investor: true, elite: true },
    { feature: "Community Access", investor: true, elite: true },
    { feature: "Dashboard Summary", investor: true, elite: true },
    { feature: "Basic AI Assistant", investor: true, elite: true },
    { feature: "Monthly Market Reports", investor: true, elite: true },
    { feature: "Priority Off-Plan Allocations", investor: false, elite: true },
    { feature: "AI Investment Blueprint Generator", investor: false, elite: true },
    { feature: "Portfolio Tracking Dashboard", investor: false, elite: true },
    { feature: "Elite-Only Deal Room", investor: false, elite: true },
    { feature: "Weekly Market Intelligence", investor: false, elite: true },
    { feature: "Monthly Live Investor Calls", investor: false, elite: true },
    { feature: "Direct Expert Consultation", investor: false, elite: true },
    { feature: "Elite Badge on Profile", investor: false, elite: true },
  ];

  const eliteFeatures = [
    {
      icon: Crown,
      title: "Priority Off-Plan Access",
      description: "Get first access to exclusive off-plan launches before they hit the market. Secure premium units at pre-launch prices.",
    },
    {
      icon: Sparkles,
      title: "AI Investment Blueprint",
      description: "Our advanced AI analyzes your goals, budget, and timeline to create personalized investment strategies for Dubai real estate.",
    },
    {
      icon: LineChart,
      title: "Portfolio Dashboard",
      description: "Track all your properties in one place. Monitor value appreciation, rental yields, and cash flow with real-time analytics.",
    },
    {
      icon: Users,
      title: "Elite Deal Room",
      description: "Access the private community where Elite members share exclusive deals, co-investment opportunities, and insider insights.",
    },
    {
      icon: Phone,
      title: "Direct Expert Line",
      description: "Skip the queue with priority access to our investment consultants. Get answers within 24 hours, not weeks.",
    },
    {
      icon: Shield,
      title: "Weekly Intelligence",
      description: "Receive curated market intelligence reports with actionable insights on emerging areas, price movements, and opportunities.",
    },
  ];

  const testimonials = [
    {
      quote: "The Elite membership paid for itself within the first month. The off-plan deal I got access to has already appreciated 15%.",
      author: "Marcus Chen",
      role: "Portfolio Manager",
      investment: "$1.2M+ Portfolio",
    },
    {
      quote: "The AI Blueprint Generator identified opportunities I would have never found on my own. Now managing 4 properties in Dubai.",
      author: "Sarah Al-Rashid",
      role: "Serial Investor",
      investment: "$2.8M+ Portfolio",
    },
    {
      quote: "Moving from Investor to Elite was the best decision. The Deal Room alone has connected me with 3 co-investment partners.",
      author: "James Mitchell",
      role: "HNWI Expat",
      investment: "$800K+ Portfolio",
    },
  ];

  const faqs = [
    {
      question: "What makes Elite different from Investor membership?",
      answer: "Elite membership is designed for serious wealth builders. You get everything in Investor plus priority off-plan access, AI-powered investment blueprints, portfolio tracking, elite-only community access, weekly market intelligence, monthly live calls, and direct expert consultation.",
    },
    {
      question: "Can I upgrade from Investor to Elite?",
      answer: "Absolutely! When you upgrade, you'll be credited for the remaining time on your current Investor subscription. The transition is seamless and you get immediate access to all Elite features.",
    },
    {
      question: "What is the AI Investment Blueprint Generator?",
      answer: "Our advanced AI analyzes your investment goals, budget, timeline, and risk tolerance to create a personalized Dubai real estate investment strategy. It recommends specific areas, property types, and timing for maximum returns.",
    },
    {
      question: "How does priority off-plan access work?",
      answer: "Elite members receive notifications about new off-plan launches 48-72 hours before public release. You also get access to exclusive allocations reserved specifically for our Elite community, often at preferential pricing.",
    },
    {
      question: "Who leads the monthly live investor calls?",
      answer: "Live calls are led by our senior investment consultants and often feature guest experts including Dubai developers, market analysts, and successful portfolio investors sharing their strategies.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        {...PAGE_SEO.elite} 
        structuredData={generateFAQSchema(faqs)}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold mb-6">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">For Serious Wealth Builders Only</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6">
              Join the <span className="text-gold">Elite Circle</span> of Dubai Investors
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Priority access to off-plan deals, AI-powered strategies, and a private network 
              of high-net-worth investors building generational wealth in Dubai.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                variant="gold"
                className="min-w-[240px] text-lg"
                onClick={handleEliteCTA}
                disabled={loading}
              >
                <Crown className="w-5 h-5 mr-2" />
                {getCTAText()} {!user || profile?.membership_tier !== "elite" ? "— $97/mo" : ""}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px]"
                onClick={() => setShowVideo(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Overview
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Limited to 100 Elite members per month • Cancel anytime • 30-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-display text-gold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Everything in Investor, <span className="text-gold">Plus So Much More</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See exactly what you unlock when you upgrade to Elite membership
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1" />
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="font-medium text-foreground">Investor</div>
                <div className="text-2xl font-display text-foreground">${STRIPE_TIERS.investor.monthly.price}<span className="text-sm text-muted-foreground">/mo</span></div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gold/10 border border-gold/30">
                <div className="flex items-center justify-center gap-1 font-medium text-gold">
                  <Crown className="w-4 h-4" />
                  Elite
                </div>
                <div className="text-2xl font-display text-gold">${STRIPE_TIERS.elite.monthly.price}<span className="text-sm text-gold/70">/mo</span></div>
              </div>
            </div>

            <div className="space-y-2">
              {comparisonFeatures.map((item, index) => (
                <motion.div
                  key={item.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="grid grid-cols-3 gap-4 py-3 border-b border-border/50"
                >
                  <div className="text-foreground text-sm md:text-base">{item.feature}</div>
                  <div className="flex justify-center">
                    {item.investor ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Check className="w-5 h-5 text-gold" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Elite Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Exclusive <span className="text-gold">Elite Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tools and access reserved exclusively for our Elite members
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {eliteFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-gold/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              What <span className="text-gold">Elite Members</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.investment}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Elite Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl bg-gradient-to-b from-gold/10 to-transparent border-2 border-gold relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-primary-foreground text-sm font-medium rounded-full">
                  Recommended
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-gold" />
                  <h3 className="font-display text-2xl text-foreground">Dubai Elite Investor</h3>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-display text-gold">${STRIPE_TIERS.elite.monthly.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold" />
                    Everything in Investor
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold" />
                    Priority off-plan access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold" />
                    AI Investment Blueprint
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold" />
                    Portfolio tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold" />
                    Elite-only community
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="gold"
                  size="lg"
                  onClick={handleEliteCTA}
                  disabled={loading}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  {getCTAText()}
                </Button>
              </motion.div>

              {/* Investor Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-xl bg-card border border-border"
              >
                <h3 className="font-display text-2xl text-foreground mb-4">Dubai Investor</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display text-foreground">${STRIPE_TIERS.investor.monthly.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    Academy courses
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    Basic tools
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    Community access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    Basic AI Assistant
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    Monthly reports
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/join")}
                >
                  View Investor Plan
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Already an Investor? Upgrade and get credited for remaining time.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Crown className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
              Ready to Join the <span className="text-gold">Elite Circle</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop watching from the sidelines. Get priority access to deals, 
              AI-powered strategies, and a network that accelerates your success.
            </p>
            <Button
              size="lg"
              variant="gold"
              className="min-w-[280px] text-lg"
              onClick={handleEliteCTA}
              disabled={loading}
            >
              <Crown className="w-5 h-5 mr-2" />
              {getCTAText()} {!user || profile?.membership_tier !== "elite" ? "— $97/mo" : ""}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              30-day money-back guarantee • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl aspect-video bg-muted rounded-xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <Play className="w-16 h-16 text-gold mx-auto mb-4" />
              <p className="text-muted-foreground">Video placeholder</p>
            </div>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EliteFunnel;
