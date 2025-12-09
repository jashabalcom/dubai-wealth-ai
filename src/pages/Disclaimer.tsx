import { motion } from 'framer-motion';
import { Shield, Scale, Bot, Building2, FileText, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Disclaimer() {
  const sections = [
    {
      icon: Building2,
      title: 'Platform Nature',
      content: `Dubai Wealth Hub is an educational platform and referral network operated by Balcom Privé. We provide real estate investment education, market analysis tools, investor community resources, and referral services to licensed professionals.

We are NOT a licensed real estate brokerage in the United Arab Emirates. We do not directly buy, sell, lease, or broker real estate transactions. All property inquiries are routed to licensed RERA-registered real estate agents and developers.`
    },
    {
      icon: Shield,
      title: 'Property Listings',
      content: `All properties displayed on this platform are presented by licensed RERA-registered real estate agents and/or developers. Each listing includes the presenting agent's RERA Broker Registration Number (BRN) when available.

Dubai Wealth Hub facilitates introductions between potential investors and licensed real estate professionals. We do not guarantee the accuracy of listing information, pricing, availability, or any claims made by agents or developers. Users should independently verify all property details before making any decisions.`
    },
    {
      icon: Scale,
      title: 'Investment Disclaimer',
      content: `All financial calculations, projections, rental yield estimates, ROI analyses, and investment recommendations provided through our tools and AI features are for EDUCATIONAL AND INFORMATIONAL PURPOSES ONLY.

This content does not constitute:
• Financial advice
• Investment advice
• Legal advice
• Tax advice
• Real estate brokerage services

Past performance and historical data do not guarantee future results. Real estate investments carry inherent risks including but not limited to market fluctuations, regulatory changes, currency risks, and economic conditions. Actual returns may differ significantly from projections.

Always consult with qualified financial advisors, legal counsel, and licensed real estate professionals before making investment decisions.`
    },
    {
      icon: Bot,
      title: 'AI-Generated Content',
      content: `Our platform uses artificial intelligence to provide investment analysis, property insights, Golden Visa guidance, and personalized recommendations. All AI-generated content is for informational and educational purposes only.

AI responses may contain inaccuracies, outdated information, or general guidance that may not apply to your specific situation. Do not rely solely on AI-generated content for investment, legal, immigration, or financial decisions.

Always verify AI-generated information with official sources and consult licensed professionals.`
    },
    {
      icon: FileText,
      title: 'Golden Visa Information',
      content: `Information about the UAE Golden Visa program is provided for general educational purposes only. This information does not constitute immigration or legal advice.

Golden Visa requirements, eligibility criteria, and application processes are subject to change by UAE authorities at any time. We do not guarantee the accuracy or completeness of Golden Visa information.

For official and current requirements, consult:
• UAE Federal Authority for Identity and Citizenship
• Authorized immigration consultants
• UAE government official websites`
    },
    {
      icon: AlertTriangle,
      title: 'Limitation of Liability',
      content: `To the fullest extent permitted by law, Dubai Wealth Hub, Balcom Privé, and their affiliates, officers, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:

• Use of this platform or its content
• Reliance on any information provided
• Investment decisions made based on platform content
• Interactions with third-party agents or developers
• AI-generated recommendations or analyses

Users assume full responsibility for their investment decisions and interactions with licensed professionals facilitated through this platform.`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-6">
              <Scale className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
              Legal Disclaimer
            </h1>
            <p className="text-lg text-muted-foreground">
              Important information about the use of Dubai Wealth Hub platform and services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 md:p-8 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-muted flex-shrink-0">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-heading text-xl text-foreground">{section.title}</h2>
                    <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-xl bg-muted/50 border border-border text-center"
          >
            <p className="text-sm text-muted-foreground">
              By using Dubai Wealth Hub, you acknowledge that you have read, understood, and agree to this disclaimer.
              For questions, contact us at{' '}
              <a href="mailto:legal@balcomprive.com" className="text-primary hover:underline">
                legal@balcomprive.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
