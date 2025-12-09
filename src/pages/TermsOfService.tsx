import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
  const lastUpdated = "December 9, 2024";

  return (
    <>
      <Helmet>
        <title>Terms of Service | Dubai Wealth Hub</title>
        <meta name="description" content="Terms of Service for Dubai Wealth Hub - Educational platform and referral network for Dubai real estate investors." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
            </div>

            <ScrollArea className="h-auto">
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">1. Introduction and Acceptance</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Dubai Wealth Hub ("Platform," "we," "us," or "our"), operated by Balcom Privé LLC. 
                    By accessing or using our Platform, you agree to be bound by these Terms of Service ("Terms"). 
                    If you do not agree to these Terms, please do not use our Platform.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms constitute a legally binding agreement between you and Balcom Privé LLC, 
                    governing your use of the Dubai Wealth Hub platform, including all content, features, 
                    and services offered.
                  </p>
                </section>

                {/* Platform Nature */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">2. Nature of Our Platform</h2>
                  <div className="bg-accent/30 border border-border rounded-lg p-6 my-4">
                    <p className="text-foreground font-medium mb-2">Important Disclosure:</p>
                    <p className="text-muted-foreground">
                      Dubai Wealth Hub is an <strong>educational platform and referral network</strong>. 
                      We are NOT a licensed real estate brokerage, investment advisor, financial planner, 
                      legal advisor, or immigration consultant.
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Platform provides:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Educational content about Dubai real estate investment</li>
                    <li>Investment analysis tools for informational purposes</li>
                    <li>Community forums for member discussion and networking</li>
                    <li>Referral services connecting users with licensed RERA-registered agents</li>
                    <li>Property listings presented by licensed real estate professionals</li>
                  </ul>
                </section>

                {/* User Eligibility */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">3. User Eligibility</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To use our Platform, you must:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Be at least 18 years of age</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Not be prohibited from using the Platform under applicable laws</li>
                    <li>Provide accurate and complete registration information</li>
                  </ul>
                </section>

                {/* Account Terms */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">4. Account Registration and Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create an account, you agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We reserve the right to suspend or terminate accounts that violate these Terms or 
                    engage in fraudulent, abusive, or illegal activities.
                  </p>
                </section>

                {/* Membership and Payments */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">5. Membership and Payment Terms</h2>
                  <h3 className="text-xl font-semibold text-foreground mt-4">5.1 Subscription Services</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer tiered membership subscriptions with varying features and pricing. 
                    By subscribing, you authorize us to charge your payment method on a recurring basis 
                    until you cancel.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">5.2 Billing and Cancellation</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Subscriptions are billed in advance on a monthly basis</li>
                    <li>You may cancel your subscription at any time through your account settings</li>
                    <li>Cancellations take effect at the end of the current billing period</li>
                    <li>We do not provide refunds for partial months or unused services</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">5.3 Price Changes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify pricing with 30 days' notice. Continued use after 
                    price changes constitutes acceptance of the new pricing.
                  </p>
                </section>

                {/* Educational Content Disclaimer */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">6. Educational Content and Disclaimers</h2>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 my-4">
                    <p className="text-foreground font-medium mb-2">Investment Risk Warning:</p>
                    <p className="text-muted-foreground">
                      All educational content, investment tools, calculators, and AI-generated analysis 
                      are provided for <strong>informational and educational purposes only</strong>. 
                      This content does NOT constitute investment advice, financial advice, legal advice, 
                      tax advice, or any other professional advice.
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    You acknowledge and agree that:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Real estate investment involves significant risk, including potential loss of capital</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>Projections and estimates are hypothetical and may not reflect actual outcomes</li>
                    <li>You should consult qualified professionals before making investment decisions</li>
                    <li>We are not responsible for investment decisions you make based on our content</li>
                  </ul>
                </section>

                {/* Property Listings */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">7. Property Listings and Agent Referrals</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Property listings displayed on our Platform are presented by licensed RERA-registered 
                    real estate agents and developers. We act solely as an intermediary facilitating 
                    introductions between users and licensed professionals.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>We do not guarantee the accuracy of property information provided by agents</li>
                    <li>We are not a party to any real estate transaction</li>
                    <li>You are responsible for conducting your own due diligence</li>
                    <li>All transactions are between you and the licensed agent/developer</li>
                  </ul>
                </section>

                {/* Intellectual Property */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">8. Intellectual Property Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on the Platform, including text, graphics, logos, images, videos, 
                    courses, and software, is owned by Balcom Privé LLC or its licensors and is 
                    protected by intellectual property laws.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    You may not:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Copy, reproduce, or distribute our content without permission</li>
                    <li>Modify, adapt, or create derivative works</li>
                    <li>Use our content for commercial purposes without authorization</li>
                    <li>Remove any copyright or proprietary notices</li>
                  </ul>
                </section>

                {/* User Conduct */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">9. User Conduct and Community Guidelines</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    When using our Platform and community features, you agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Post false, misleading, or fraudulent content</li>
                    <li>Harass, abuse, or threaten other users</li>
                    <li>Spam or send unsolicited commercial messages</li>
                    <li>Impersonate any person or entity</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the Platform</li>
                  </ul>
                </section>

                {/* Limitation of Liability */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">10. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>
                      THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND
                    </li>
                    <li>
                      WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, 
                      FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT
                    </li>
                    <li>
                      WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                      OR PUNITIVE DAMAGES
                    </li>
                    <li>
                      OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS 
                      PRECEDING THE CLAIM
                    </li>
                  </ul>
                </section>

                {/* Indemnification */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">11. Indemnification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to indemnify, defend, and hold harmless Balcom Privé LLC, its officers, 
                    directors, employees, and agents from any claims, damages, losses, or expenses 
                    arising from your use of the Platform, violation of these Terms, or infringement 
                    of any third-party rights.
                  </p>
                </section>

                {/* Governing Law - Multi-Jurisdiction */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">12. Governing Law and Jurisdiction</h2>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">12.1 United States Users</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For users residing in the United States, these Terms shall be governed by and 
                    construed in accordance with the laws of the State of Georgia, without regard 
                    to conflict of law principles. Any disputes shall be resolved in the state or 
                    federal courts located in Fulton County, Georgia.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-4">12.2 European Union Users (GDPR Compliance)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For users residing in the European Union, European Economic Area, or United Kingdom, 
                    nothing in these Terms shall limit any rights you may have under the General Data 
                    Protection Regulation (GDPR) or other applicable consumer protection laws. 
                    You may bring proceedings in your country of residence.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-4">12.3 United Arab Emirates Users</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For users residing in the UAE, these Terms shall be interpreted in accordance with 
                    UAE Federal laws where applicable. For matters related to Dubai real estate, 
                    relevant RERA and Dubai Land Department regulations shall apply. Disputes may be 
                    submitted to the Dubai Courts or DIFC Courts as appropriate.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-4">12.4 International Users</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For users in other jurisdictions, these Terms shall be governed by US law (State of Georgia), 
                    except where local mandatory consumer protection laws provide otherwise.
                  </p>
                </section>

                {/* Dispute Resolution */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">13. Dispute Resolution</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Before initiating any legal proceedings, you agree to first contact us to attempt 
                    to resolve any dispute informally. If we cannot resolve the dispute within 30 days, 
                    either party may proceed with formal dispute resolution.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    For US users, you agree that any dispute shall be resolved through binding arbitration 
                    administered by the American Arbitration Association, except for claims that may be 
                    brought in small claims court.
                  </p>
                </section>

                {/* Modifications */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">14. Modifications to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify you of 
                    material changes by posting the updated Terms on our Platform and updating the 
                    "Last Updated" date. Your continued use of the Platform after such changes 
                    constitutes acceptance of the modified Terms.
                  </p>
                </section>

                {/* Severability */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">15. Severability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If any provision of these Terms is found to be unenforceable or invalid, 
                    that provision shall be limited or eliminated to the minimum extent necessary, 
                    and the remaining provisions shall remain in full force and effect.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">16. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="bg-card border border-border rounded-lg p-6 mt-4">
                    <p className="text-foreground font-semibold">Balcom Privé LLC</p>
                    <p className="text-muted-foreground">Email: legal@dubaiwealthhub.com</p>
                    <p className="text-muted-foreground">Address: Atlanta, Georgia, United States</p>
                  </div>
                </section>

              </div>
            </ScrollArea>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
