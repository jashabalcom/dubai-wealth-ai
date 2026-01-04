import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Check, ArrowRight, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNav } from '@/components/seo/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { generateBreadcrumbSchema, generateFAQSchema, SITE_CONFIG } from '@/lib/seo-config';

const PAYMENT_PLANS = [
  {
    name: '80/20 Payment Plan',
    description: 'Pay 80% during construction, 20% on handover',
    structure: [
      { phase: 'Booking', percentage: 10, timing: 'On booking' },
      { phase: 'Construction', percentage: 70, timing: 'During construction' },
      { phase: 'Handover', percentage: 20, timing: 'On completion' },
    ],
    pros: ['Lower upfront cost', 'Spread payments over construction', 'Good for long-term investors'],
    cons: ['Higher total before handover', 'Construction risk exposure'],
    idealFor: 'Long-term investors who want to spread costs',
  },
  {
    name: '60/40 Payment Plan',
    description: 'Pay 60% during construction, 40% on handover',
    structure: [
      { phase: 'Booking', percentage: 10, timing: 'On booking' },
      { phase: 'Construction', percentage: 50, timing: 'During construction' },
      { phase: 'Handover', percentage: 40, timing: 'On completion' },
    ],
    pros: ['Balanced approach', 'More leverage at handover', 'Can arrange mortgage for 40%'],
    cons: ['Moderate construction payments', 'Need funds ready for handover'],
    idealFor: 'Buyers planning to mortgage the final 40%',
  },
  {
    name: '50/50 Payment Plan',
    description: 'Split equally between construction and handover',
    structure: [
      { phase: 'Booking', percentage: 10, timing: 'On booking' },
      { phase: 'Construction', percentage: 40, timing: 'During construction' },
      { phase: 'Handover', percentage: 50, timing: 'On completion' },
    ],
    pros: ['Easy to understand', 'Maximum mortgage leverage', 'Lower construction exposure'],
    cons: ['Large sum needed at handover', 'Less time to save'],
    idealFor: 'Cash-ready buyers or those with confirmed financing',
  },
  {
    name: 'Post-Handover Payment Plan',
    description: 'Continue payments after receiving keys',
    structure: [
      { phase: 'Booking', percentage: 10, timing: 'On booking' },
      { phase: 'Construction', percentage: 30, timing: 'During construction' },
      { phase: 'Handover', percentage: 10, timing: 'On completion' },
      { phase: 'Post-Handover', percentage: 50, timing: '2-5 years after handover' },
    ],
    pros: ['Move in with minimal payment', 'Rental income covers payments', 'Interest-free financing'],
    cons: ['Premium pricing', 'Long-term commitment', 'Limited developer options'],
    idealFor: 'Investors who want rental income to cover payments',
  },
];

const FAQ_ITEMS = [
  {
    question: "What is a payment plan for off-plan property?",
    answer: "A payment plan is the schedule of installments you pay when buying off-plan property. It's typically split between booking, construction milestones, and handover. Dubai developers offer various plans from 80/20 to post-handover options."
  },
  {
    question: "Which payment plan is best for investors?",
    answer: "For rental investors, post-handover plans are often best as rental income helps cover remaining payments. For flippers, 80/20 or 60/40 plans minimize capital tied up. Consider your timeline, cash flow, and exit strategy."
  },
  {
    question: "Can I get a mortgage for off-plan property?",
    answer: "Yes, some UAE banks offer off-plan mortgages, typically releasing funds at handover. You'll need to cover construction payments yourself. The mortgage usually covers 50-75% of the property value for non-residents."
  },
  {
    question: "What happens if I can't complete the payments?",
    answer: "If you default, developers typically issue warnings before terminating the contract. You may forfeit a percentage of payments made (usually 25-40%). Some contracts allow assignment to another buyer to avoid forfeiture."
  },
];

export default function PaymentPlansGuide() {
  const breadcrumbs = [
    { label: 'Off-Plan', href: '/off-plan' },
    { label: 'Payment Plans' },
  ];

  return (
    <>
      <SEOHead
        title="Dubai Off-Plan Payment Plans Guide 2025 — Compare 80/20, 60/40, Post-Handover"
        description="Complete guide to Dubai off-plan payment plans. Compare 80/20, 60/40, 50/50, and post-handover options. Understand which plan suits your investment strategy."
        keywords={[
          'Dubai payment plan',
          'off-plan payment plan Dubai',
          '80/20 payment plan',
          '60/40 payment plan',
          'post-handover payment plan',
          'Dubai property installments',
          'buy property Dubai installments',
        ]}
        canonical={`${SITE_CONFIG.url}/off-plan/payment-plans`}
        structuredData={[
          generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Off-Plan', url: `${SITE_CONFIG.url}/off-plan` },
            { name: 'Payment Plans', url: `${SITE_CONFIG.url}/off-plan/payment-plans` },
          ]),
          generateFAQSchema(FAQ_ITEMS),
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4">
            <BreadcrumbNav items={breadcrumbs} className="mb-6" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-gold" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                Dubai <span className="text-gradient-gold">Payment Plans</span> Guide
              </h1>
              <p className="text-lg text-muted-foreground">
                Understand the different payment structures for off-plan property in Dubai. 
                Find the plan that matches your investment strategy and cash flow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Key Takeaways
              </h2>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  Most plans require 10-20% on booking with construction-linked installments
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  Post-handover plans let you use rental income to cover payments
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  60/40 and 50/50 plans work well with handover mortgages
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  All plans are typically interest-free during construction
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment Plans Comparison */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              Compare Payment Plans
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {PAYMENT_PLANS.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-heading text-xl text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  {/* Structure */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Payment Structure</h4>
                    <div className="space-y-2">
                      {plan.structure.map((phase) => (
                        <div key={phase.phase} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{phase.phase}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{phase.percentage}%</span>
                            <span className="text-xs text-muted-foreground">({phase.timing})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Pros</h4>
                      <ul className="space-y-1">
                        {plan.pros.map((pro) => (
                          <li key={pro} className="text-xs text-muted-foreground flex items-start gap-1">
                            <Check className="w-3 h-3 text-green-500 mt-0.5" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Cons</h4>
                      <ul className="space-y-1">
                        {plan.cons.map((con) => (
                          <li key={con} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-red-500">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Ideal for: </span>
                      <span className="text-foreground">{plan.idealFor}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ_ITEMS.map((faq, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl text-foreground mb-4">
              Ready to Explore Off-Plan Projects?
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse current off-plan developments and compare payment plans
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/off-plan">
                <Button className="bg-gold hover:bg-gold/90 text-background">
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </Link>
              <Link to="/tools/offplan">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Payment Calculator
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
