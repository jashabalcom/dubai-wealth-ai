import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const CookiePolicy = () => {
  const lastUpdated = "December 26, 2024";

  return (
    <>
      <Helmet>
        <title>Cookie Policy | Dubai Wealth Hub</title>
        <meta name="description" content="Cookie Policy for Dubai Wealth Hub - How we use cookies and similar technologies on our platform." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Cookie Policy
              </h1>
              <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
            </div>

            <ScrollArea className="h-auto">
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Cookie Policy explains how Balcom Privé LLC ("we," "us," or "our") uses cookies 
                    and similar tracking technologies on Dubai Wealth Hub. By using our Platform, you 
                    consent to the use of cookies as described in this policy.
                  </p>
                </section>

                {/* What Are Cookies */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">2. What Are Cookies?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
                    when you visit a website. They help the website recognize your device and remember 
                    information about your visit, such as your preferences and actions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We also use similar technologies like local storage and session storage, which serve 
                    similar purposes to cookies.
                  </p>
                </section>

                {/* Types of Cookies */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">3. Types of Cookies We Use</h2>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-6">3.1 Essential Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies are necessary for the Platform to function properly. They enable core 
                    functionality such as:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>User authentication and session management</li>
                    <li>Security features and fraud prevention</li>
                    <li>Remembering items in your comparison list</li>
                    <li>Load balancing and performance optimization</li>
                  </ul>
                  <div className="bg-card border border-border rounded-lg p-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Essential cookies cannot be disabled as they are required 
                      for the Platform to work.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-6">3.2 Preference Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies remember your choices and preferences to enhance your experience:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Language preferences</li>
                    <li>Currency display settings</li>
                    <li>Theme preferences (light/dark mode)</li>
                    <li>Recently viewed properties</li>
                    <li>Cookie consent preferences</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6">3.3 Analytics Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies help us understand how visitors interact with our Platform:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Pages visited and time spent on each page</li>
                    <li>Features used and actions taken</li>
                    <li>Error tracking and performance monitoring</li>
                    <li>Traffic sources and user journeys</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We use this data to improve our Platform and provide a better experience. Analytics 
                    data is aggregated and anonymized where possible.
                  </p>
                </section>

                {/* Third-Party Cookies */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">4. Third-Party Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Some cookies are placed by third-party services that appear on our pages:
                  </p>
                  
                  <div className="space-y-4 mt-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="font-semibold text-foreground">Stripe</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used for secure payment processing. Stripe sets cookies to detect fraud 
                        and enable secure transactions.
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="font-semibold text-foreground">Supabase</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used for authentication and session management. Stores secure tokens to 
                        keep you logged in.
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="font-semibold text-foreground">Google Analytics</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used to collect anonymous usage statistics. Helps us understand how 
                        visitors use our Platform.
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="font-semibold text-foreground">Sentry</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used for error tracking and performance monitoring. Helps us identify 
                        and fix issues quickly.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cookie Duration */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">5. Cookie Duration</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies can be either session or persistent:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                    <li>
                      <strong>Session Cookies:</strong> Temporary cookies that are deleted when you 
                      close your browser. Used for authentication and security.
                    </li>
                    <li>
                      <strong>Persistent Cookies:</strong> Remain on your device for a set period or 
                      until you delete them. Used for preferences and analytics.
                    </li>
                  </ul>
                </section>

                {/* Managing Cookies */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">6. Managing Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You can control and manage cookies in several ways:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-4">6.1 Browser Settings</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Most browsers allow you to refuse or accept cookies, delete existing cookies, or 
                    set preferences for certain websites. Common browser settings:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                    <li>Chrome: Settings → Privacy and Security → Cookies</li>
                    <li>Firefox: Settings → Privacy & Security → Cookies</li>
                    <li>Safari: Preferences → Privacy → Cookies</li>
                    <li>Edge: Settings → Privacy, Search, and Services → Cookies</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-4">6.2 Cookie Consent Banner</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you first visit our Platform, you'll see a cookie consent banner. You can 
                    choose to accept or customize your cookie preferences.
                  </p>

                  <div className="bg-accent/30 border border-border rounded-lg p-4 my-4">
                    <p className="text-foreground font-medium">Important:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Disabling certain cookies may affect Platform functionality. Essential cookies 
                      cannot be disabled as they are required for core features like authentication.
                    </p>
                  </div>
                </section>

                {/* Do Not Track */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">7. Do Not Track</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Some browsers have a "Do Not Track" feature that signals to websites that you 
                    don't want to be tracked. We currently do not respond to Do Not Track signals, 
                    but you can manage your tracking preferences through our cookie consent banner 
                    and browser settings.
                  </p>
                </section>

                {/* Updates */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">8. Updates to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our 
                    practices or for legal, operational, or regulatory reasons. We will notify you 
                    of any material changes by posting the updated policy on our Platform.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-display font-semibold text-foreground">9. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <div className="bg-card border border-border rounded-lg p-6 mt-4">
                    <p className="text-foreground font-semibold">Balcom Privé LLC</p>
                    <p className="text-muted-foreground">Email: privacy@dubaiwealthhub.com</p>
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

export default CookiePolicy;
