import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Building2, Users, Target, Globe } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Dubai Wealth Hub</title>
        <meta name="description" content="Learn about Dubai Wealth Hub - Your trusted platform for Dubai real estate investment intelligence, education, and community." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                About Dubai Wealth Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Empowering investors with the intelligence they need to succeed in Dubai real estate.
              </p>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
              {/* Mission Section */}
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Dubai Wealth Hub exists to democratize access to Dubai real estate investment intelligence. 
                  We believe that every investor—whether first-time buyer or seasoned portfolio manager—deserves 
                  access to the same quality research, tools, and community that was once reserved for 
                  institutional players and ultra-high-net-worth individuals.
                </p>
              </section>

              {/* What We Do */}
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground">What We Do</h2>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <Building2 className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Investment Intelligence</h3>
                    <p className="text-muted-foreground text-sm">
                      Access comprehensive property data, market analytics, and AI-powered insights 
                      to make informed investment decisions.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <Target className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Professional Tools</h3>
                    <p className="text-muted-foreground text-sm">
                      Use our suite of calculators for ROI analysis, mortgage planning, rental yields, 
                      and total cost estimation.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <Users className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Investor Community</h3>
                    <p className="text-muted-foreground text-sm">
                      Connect with fellow investors, share insights, and learn from experienced 
                      members in our exclusive community.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <Globe className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Education Academy</h3>
                    <p className="text-muted-foreground text-sm">
                      Master Dubai real estate through structured courses covering everything from 
                      basics to advanced investment strategies.
                    </p>
                  </div>
                </div>
              </section>

              {/* Why Dubai */}
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground">Why Dubai?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Dubai has emerged as one of the world's most attractive real estate markets, offering 
                  tax-free property ownership, high rental yields, world-class infrastructure, and a 
                  strategic location bridging East and West. The city continues to break records in 
                  transaction volumes, attracting investors from over 150 countries.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We focus exclusively on Dubai because we believe in depth over breadth. By specializing 
                  in a single market, we can provide unmatched insights, relationships, and value to our members.
                </p>
              </section>

              {/* Company Info */}
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground">Our Company</h2>
                <div className="bg-card border border-border rounded-lg p-6 mt-4">
                  <p className="text-foreground font-semibold">Balcom Privé LLC</p>
                  <p className="text-muted-foreground mt-2">
                    Dubai Real Estate Investor is operated by Balcom Privé LLC, a company dedicated to providing 
                    premium real estate investment platforms and services.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      For inquiries: <a href="mailto:hello@dubairealestateinvestor.com" className="text-primary hover:underline">hello@dubairealestateinvestor.com</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Values */}
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground">Our Values</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li><strong>Transparency:</strong> We provide honest, unbiased information without hidden agendas.</li>
                  <li><strong>Excellence:</strong> We strive for the highest quality in everything we deliver.</li>
                  <li><strong>Community:</strong> We believe investors succeed together, not alone.</li>
                  <li><strong>Education:</strong> We empower members with knowledge to make their own decisions.</li>
                  <li><strong>Innovation:</strong> We continuously improve our tools and insights using cutting-edge technology.</li>
                </ul>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
