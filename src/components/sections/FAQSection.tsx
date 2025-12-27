import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet";

const faqs = [
  {
    question: "Can foreigners buy property in Dubai?",
    answer: "Yes, foreigners can purchase freehold property in designated areas of Dubai. These include popular areas like Dubai Marina, Downtown Dubai, Palm Jumeirah, and JBR. There are no restrictions on nationality, and you can own the property outright with full ownership rights.",
  },
  {
    question: "What is the minimum investment for a Golden Visa through real estate?",
    answer: "The minimum investment for a 10-year Golden Visa through real estate is AED 2 million (approximately $545,000 USD). The property must be fully paid (not mortgaged) and held for at least 3 years. Multiple properties can be combined to meet this threshold.",
  },
  {
    question: "What are the typical rental yields in Dubai?",
    answer: "Dubai offers some of the highest rental yields globally, typically ranging from 5-8% for apartments and 4-6% for villas. Areas like Dubai Silicon Oasis, JVC, and Sports City often see yields above 7%, while prime areas like Downtown and Palm Jumeirah average 4-6%.",
  },
  {
    question: "Are there property taxes in Dubai?",
    answer: "Dubai has no annual property tax, income tax, or capital gains tax on real estate. The main costs are a one-time 4% DLD registration fee at purchase, annual service charges (typically AED 10-25 per sq ft), and a 5% municipality fee on rental income.",
  },
  {
    question: "What is off-plan vs ready property?",
    answer: "Off-plan properties are sold before or during construction, often with payment plans spread over the construction period (typically 3-4 years). Ready properties are completed units available for immediate handover. Off-plan usually offers lower entry prices and flexible payments, while ready properties provide immediate rental income.",
  },
  {
    question: "How do I verify a developer's legitimacy?",
    answer: "Check the developer's registration with RERA (Real Estate Regulatory Authority). Verify the project has an escrow account registered with DLD. Review the developer's track record of completed projects. Use platforms like Dubai Wealth Hub to research developer ratings and project histories.",
  },
  {
    question: "What are service charges and how are they calculated?",
    answer: "Service charges cover building maintenance, security, common area utilities, and amenities. They're calculated per square foot annually, typically ranging from AED 10-30 depending on the building's facilities. Luxury buildings with extensive amenities have higher charges. These are mandatory and set by the RERA index.",
  },
  {
    question: "Can I get a mortgage as a non-resident?",
    answer: "Yes, UAE banks offer mortgages to non-residents, typically up to 50% LTV (loan-to-value) for non-residents vs 80% for residents. Interest rates range from 4-6%. You'll need proof of income, bank statements, and passport copies. Some banks require a minimum property value of AED 1 million.",
  },
];

// Generate JSON-LD structured data for FAQs
const generateFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

export function FAQSection() {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
      </Helmet>

      <section className="relative py-20 md:py-28 bg-background">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-primary" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary">
                Common Questions
              </span>
              <span className="h-px w-12 bg-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-4">
              Dubai Real Estate
              <span className="text-gradient-gold"> FAQ</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answers to the most common questions from international investors
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-medium text-foreground hover:text-primary py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              Have more questions?{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contact our team
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
