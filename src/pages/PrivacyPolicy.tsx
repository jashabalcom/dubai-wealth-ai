import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  const lastUpdated = "December 9, 2024";

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Dubai Wealth Hub</title>
        <meta name="description" content="Privacy Policy for Dubai Wealth Hub - How we collect, use, and protect your personal data." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
            </div>

            <ScrollArea className="h-auto">
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Balcom Privé LLC ("we," "us," or "our") operates Dubai Wealth Hub. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your personal information when 
                    you use our Platform.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We are committed to protecting your privacy and complying with applicable data protection 
                    laws, including the General Data Protection Regulation (GDPR) for EU users, the California 
                    Consumer Privacy Act (CCPA) for California residents, and UAE Federal Decree-Law No. 45 
                    of 2021 on Personal Data Protection.
                  </p>
                </section>

                {/* Data Controller */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">2. Data Controller</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The data controller responsible for your personal information is:
                  </p>
                  <div className="bg-card border border-border rounded-lg p-6 mt-4">
                    <p className="text-foreground font-semibold">Balcom Privé LLC</p>
                    <p className="text-muted-foreground">Email: privacy@dubaiwealthhub.com</p>
                    <p className="text-muted-foreground">Address: Atlanta, Georgia, United States</p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">3. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">3.1 Information You Provide</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                    <li><strong>Profile Information:</strong> Country, bio, investment goals, budget range, timeline</li>
                    <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely by Stripe)</li>
                    <li><strong>Communication Data:</strong> Messages, community posts, inquiries, support requests</li>
                    <li><strong>Form Submissions:</strong> Golden Visa wizard submissions, property inquiries</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">3.2 Information Collected Automatically</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                    <li><strong>Location Data:</strong> IP address, approximate geographic location</li>
                    <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">3.3 Information from Third Parties</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Authentication Providers:</strong> If you sign in with Google or other OAuth providers</li>
                    <li><strong>Payment Processors:</strong> Transaction confirmations from Stripe</li>
                    <li><strong>Analytics Services:</strong> Aggregated usage statistics</li>
                  </ul>
                </section>

                {/* Legal Basis (GDPR) */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">4. Legal Basis for Processing (GDPR)</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For users in the European Union, we process personal data based on the following legal grounds:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Contract Performance:</strong> To provide our services and fulfill membership obligations</li>
                    <li><strong>Consent:</strong> For marketing communications and optional features (you may withdraw consent anytime)</li>
                    <li><strong>Legitimate Interests:</strong> For fraud prevention, security, analytics, and service improvement</li>
                    <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                  </ul>
                </section>

                {/* How We Use Information */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">5. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use your personal information to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide, maintain, and improve our Platform and services</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Personalize your experience and provide relevant content</li>
                    <li>Facilitate connections between members and licensed real estate agents</li>
                    <li>Send transactional emails (account confirmations, password resets)</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Respond to inquiries and provide customer support</li>
                    <li>Detect and prevent fraud, abuse, and security threats</li>
                    <li>Analyze usage patterns to improve our services</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                {/* Information Sharing */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">6. Information Sharing and Disclosure</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may share your personal information with:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">6.1 Service Providers</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Supabase:</strong> Database and authentication services</li>
                    <li><strong>Stripe:</strong> Payment processing</li>
                    <li><strong>Resend:</strong> Email delivery services</li>
                    <li><strong>Analytics providers:</strong> Usage analytics and performance monitoring</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">6.2 Real Estate Professionals</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you submit a property inquiry, we share your contact information with the 
                    relevant RERA-licensed agent or developer to facilitate your request.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-4">6.3 Legal Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose information when required by law, court order, or government request, 
                    or to protect our rights, property, or safety.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-4">6.4 Business Transfers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In connection with a merger, acquisition, or sale of assets, your information may 
                    be transferred to the acquiring entity.
                  </p>

                  <div className="bg-accent/30 border border-border rounded-lg p-6 my-4">
                    <p className="text-foreground font-medium">We Do NOT:</p>
                    <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                      <li>Sell your personal information to third parties</li>
                      <li>Share your data for third-party advertising purposes</li>
                      <li>Provide your information to data brokers</li>
                    </ul>
                  </div>
                </section>

                {/* International Transfers */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">7. International Data Transfers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and processed in countries other than your 
                    country of residence, including the United States. When we transfer data internationally, 
                    we implement appropriate safeguards:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Standard Contractual Clauses approved by the European Commission</li>
                    <li>Data processing agreements with all service providers</li>
                    <li>Appropriate security measures to protect your data</li>
                  </ul>
                </section>

                {/* Data Retention */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">8. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide our services and maintain your account</li>
                    <li>Comply with legal obligations (e.g., tax records for 7 years)</li>
                    <li>Resolve disputes and enforce our agreements</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    After account deletion, we may retain anonymized or aggregated data for analytics 
                    purposes. Some data may be retained in backups for a limited period.
                  </p>
                </section>

                {/* Your Rights */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">9. Your Privacy Rights</h2>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">9.1 Rights for All Users</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">9.2 Additional Rights for EU/UK Users (GDPR)</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                    <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                    <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                    <li><strong>Withdraw Consent:</strong> Withdraw consent at any time (without affecting prior processing)</li>
                    <li><strong>Lodge Complaint:</strong> File a complaint with your local data protection authority</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">9.3 California Residents (CCPA/CPRA)</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    California residents have additional rights under the California Consumer Privacy Act:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Right to Know:</strong> Request disclosure of personal information collected</li>
                    <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                    <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (we do not sell data)</li>
                    <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">9.4 UAE Residents</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Under UAE Federal Decree-Law No. 45 of 2021, you have rights to access, correct, 
                    and request deletion of your personal data. We process data in accordance with 
                    UAE data protection requirements.
                  </p>

                  <div className="bg-card border border-border rounded-lg p-6 my-4">
                    <p className="text-foreground font-medium">To Exercise Your Rights:</p>
                    <p className="text-muted-foreground mt-2">
                      Contact us at <strong>privacy@dubaiwealthhub.com</strong> or use the account 
                      settings in your dashboard. We will respond within 30 days (or sooner as required 
                      by applicable law).
                    </p>
                  </div>
                </section>

                {/* Cookies */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">10. Cookies and Tracking Technologies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Essential Cookies:</strong> Enable core functionality (authentication, security)</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li><strong>Analytics Cookies:</strong> Understand how you use our Platform</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    You can manage cookie preferences through your browser settings. Note that disabling 
                    certain cookies may affect Platform functionality.
                  </p>
                </section>

                {/* Security */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">11. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your 
                    personal information, including:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    While we strive to protect your information, no method of transmission over the 
                    Internet is 100% secure. We cannot guarantee absolute security.
                  </p>
                </section>

                {/* Children */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">12. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Platform is not intended for children under 18 years of age. We do not knowingly 
                    collect personal information from children. If you believe a child has provided us 
                    with personal information, please contact us immediately.
                  </p>
                </section>

                {/* Third-Party Links */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">13. Third-Party Links</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Platform may contain links to third-party websites (e.g., agent websites, 
                    developer portals). We are not responsible for the privacy practices of these 
                    external sites. We encourage you to review their privacy policies.
                  </p>
                </section>

                {/* Changes */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">14. Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of material 
                    changes by:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Posting the updated policy on our Platform</li>
                    <li>Updating the "Last Updated" date</li>
                    <li>Sending an email notification for significant changes</li>
                  </ul>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">15. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions, concerns, or to exercise your privacy rights, contact us at:
                  </p>
                  <div className="bg-card border border-border rounded-lg p-6 mt-4">
                    <p className="text-foreground font-semibold">Privacy Team - Balcom Privé LLC</p>
                    <p className="text-muted-foreground">Email: privacy@dubaiwealthhub.com</p>
                    <p className="text-muted-foreground">General Inquiries: support@dubaiwealthhub.com</p>
                    <p className="text-muted-foreground">Address: Atlanta, Georgia, United States</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    <strong>For EU Users:</strong> If you are not satisfied with our response, you have 
                    the right to lodge a complaint with your local Data Protection Authority.
                  </p>
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

export default PrivacyPolicy;
