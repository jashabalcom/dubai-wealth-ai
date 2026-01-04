import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Play, 
  TrendingUp, 
  GraduationCap, 
  Calculator, 
  Users, 
  MessageSquare,
  Shield,
  Star,
  ChevronDown,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";
import { PAGE_SEO, generateFAQSchema } from "@/lib/seo-config";

const features = [
  {
    icon: GraduationCap,
    title: "Full Academy Access",
    description: "50+ video lessons covering everything from market basics to advanced investment strategies",
  },
  {
    icon: Calculator,
    title: "Investment Tools Suite",
    description: "ROI calculator, mortgage analyzer, rent vs buy comparisons, and Airbnb yield projections",
  },
  {
    icon: Users,
    title: "Community Access",
    description: "Connect with fellow investors, share insights, and learn from experienced Dubai property owners",
  },
  {
    icon: TrendingUp,
    title: "Monthly Market Reports",
    description: "Stay informed with curated insights on Dubai real estate trends, opportunities, and market shifts",
  },
  {
    icon: MessageSquare,
    title: "AI Investment Assistant",
    description: "Get personalized answers to your Dubai real estate questions powered by advanced AI",
  },
  {
    icon: Shield,
    title: "Off-Plan Project Browser",
    description: "Explore vetted off-plan developments with payment plans, yields, and developer info",
  },
];

const testimonials = [
  {
    name: "James R.",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    quote: "The Academy alone is worth 10x the membership. I went from knowing nothing about Dubai to closing on my first property in 4 months.",
    role: "First-time Investor",
  },
  {
    name: "Sarah M.",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    quote: "The community and tools helped me avoid costly mistakes. The ROI calculator saved me from a bad deal.",
    role: "Property Portfolio Owner",
  },
  {
    name: "Ahmed K.",
    location: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    quote: "Even as a local, I learned strategies I never knew. The market reports give me an edge over other investors.",
    role: "Experienced Investor",
  },
];

const faqs = [
  {
    question: "What's included in the Dubai Investor membership?",
    answer: "You get full access to our Academy with 50+ lessons, all investment tools (ROI calculator, mortgage analyzer, rent vs buy, Airbnb yield), community channels, monthly market reports, AI assistant, and the off-plan project browser.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. There are no contracts or commitments. You can cancel your subscription at any time through your account settings, and you'll retain access until the end of your billing period.",
  },
  {
    question: "Is this suitable for complete beginners?",
    answer: "Yes! Our Academy is designed to take you from zero knowledge to confident investor. We start with the fundamentals and progressively cover more advanced strategies.",
  },
  {
    question: "Do I need to be in Dubai to benefit?",
    answer: "Not at all. Many of our members invest remotely from the UK, Europe, North America, and Asia. Our tools and community help you navigate the process from anywhere in the world.",
  },
  {
    question: "What's the difference between Investor and Elite?",
    answer: "Dubai Investor gives you everything you need to start and grow. Elite adds priority off-plan allocations, the AI Investment Blueprint Generator, portfolio tracking, elite-only channels, and direct expert consultation.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not completely satisfied, contact us within 30 days for a full refund, no questions asked.",
  },
];

export default function MembershipFunnel() {
  const { user, profile } = useAuth();
  const { loading, startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleCTA = async () => {
    if (!user) {
      sessionStorage.setItem('pending_checkout_tier', 'investor');
      navigate('/auth');
      return;
    }
    
    if (profile?.membership_tier === 'investor' || profile?.membership_tier === 'elite') {
      navigate('/dashboard');
      return;
    }

    await startCheckout('investor');
  };

  const ctaText = !user 
    ? "Start Your Journey — $29/mo" 
    : profile?.membership_tier !== 'free' 
    ? "Go to Dashboard" 
    : "Unlock Full Access — $29/mo";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        {...PAGE_SEO.membership} 
        structuredData={generateFAQSchema(faqs)}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container-luxury relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Join 2,500+ Smart Investors
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 leading-tight">
              Master Dubai Real Estate
              <br />
              <span className="text-gradient-gold">Without the Guesswork</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Get the education, tools, and community you need to invest confidently in the world's most exciting property market — starting at just $29/month.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={handleCTA}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg"
                onClick={() => setVideoPlaying(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Overview
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              30-day money-back guarantee · Cancel anytime · No hidden fees
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container-luxury">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl font-serif text-foreground">2,500+</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-foreground">$180M+</div>
              <div className="text-sm text-muted-foreground">Member Investments</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-foreground">50+</div>
              <div className="text-sm text-muted-foreground">Video Lessons</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">4.9/5 Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground">
              One membership. Complete access to education, tools, and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-muted/30">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Trusted by Investors Worldwide
            </h2>
            <p className="text-muted-foreground">
              See what our members are saying about their experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-1 text-primary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role} · {testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="section-padding">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card border-2 border-primary rounded-2xl p-8 md:p-12 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Most Popular
              </span>
              <h2 className="text-3xl font-serif text-foreground mb-2">Dubai Investor Membership</h2>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-5xl font-serif text-foreground">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-8">
                Full access to everything you need to start investing in Dubai real estate.
              </p>

              <ul className="text-left space-y-3 mb-8 max-w-sm mx-auto">
                {[
                  "Full Academy access (50+ lessons)",
                  "All investment tools & calculators",
                  "Core community channels",
                  "Monthly market reports",
                  "Basic AI Assistant",
                  "Off-plan project browser",
                  "Email support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>

              <Button 
                size="lg" 
                className="w-full text-lg"
                onClick={handleCTA}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {ctaText}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                30-day money-back guarantee · Cancel anytime
              </p>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={() => navigate('/pricing')}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Compare all plans →
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/30">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
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
      <section className="section-padding">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Ready to Start Your Dubai Investment Journey?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of investors who are building wealth through Dubai real estate.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10"
              onClick={handleCTA}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {videoPlaying && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setVideoPlaying(false)}
        >
          <div className="bg-card rounded-xl p-8 max-w-2xl w-full text-center">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              <div className="text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-2" />
                <p>Video coming soon</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setVideoPlaying(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
