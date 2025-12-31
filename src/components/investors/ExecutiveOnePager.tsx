import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, Calculator, Brain, TrendingUp, Users, Mail, Linkedin, Download } from "lucide-react";
import { useRef } from "react";

export const ExecutiveOnePager = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Button - Hidden in print */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div 
        ref={containerRef}
        className="max-w-4xl mx-auto p-8 md:p-12 print:p-8 print:max-w-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dubai Wealth Hub
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              The Intelligence Platform for Global Real Estate Investors
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Seed Round</p>
            <p className="font-semibold text-foreground">$500K - $1M</p>
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs">!</span>
              The Problem
            </h2>
            <p className="text-sm text-muted-foreground">
              International investors lose <span className="font-semibold text-foreground">5-15% of their capital</span> to 
              information asymmetry when investing in Dubai—overpaying for properties, missing hidden costs, 
              and relying on conflicted advice from agents.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✓</span>
              Our Solution
            </h2>
            <p className="text-sm text-muted-foreground">
              Dubai Wealth Hub provides <span className="font-semibold text-foreground">institutional-grade intelligence</span> to 
              individual investors—comprehensive data, professional tools, and structured education that 
              levels the playing field against local insiders.
            </p>
          </div>
        </div>

        {/* Platform Features */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-card border border-border rounded-xl">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">Property Research</p>
            <p className="text-xs text-muted-foreground">Listings + Analytics</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-xl">
            <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">Investor Academy</p>
            <p className="text-xs text-muted-foreground">Structured Learning</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-xl">
            <Calculator className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">11 Pro Tools</p>
            <p className="text-xs text-muted-foreground">ROI, Mortgage, STR</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-xl">
            <Brain className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">AI Analysis</p>
            <p className="text-xs text-muted-foreground">Smart Recommendations</p>
          </div>
        </div>

        {/* Metrics & Market */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Traction
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold">200+</p>
                <p className="text-muted-foreground text-xs">Properties Listed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">15+</p>
                <p className="text-muted-foreground text-xs">Neighborhoods</p>
              </div>
              <div>
                <p className="text-2xl font-bold">25+</p>
                <p className="text-muted-foreground text-xs">Academy Lessons</p>
              </div>
              <div>
                <p className="text-2xl font-bold">11</p>
                <p className="text-muted-foreground text-xs">Investment Tools</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">Market Opportunity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">TAM (Dubai RE Market)</span>
                <span className="font-semibold">$30B+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SAM (International Investors)</span>
                <span className="font-semibold">$9B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SOM (Year 5 Target)</span>
                <span className="font-semibold">$450M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Model */}
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <h3 className="font-bold mb-4">Business Model</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-primary mb-2">B2C Subscriptions</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Free tier: Limited access, lead capture</li>
                <li>• Investor ($29/mo): Full tools + academy</li>
                <li>• Elite ($99/mo): AI analysis + Golden Visa</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-primary mb-2">B2B Revenue</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Agent subscriptions ($99-499/mo)</li>
                <li>• Developer featured listings</li>
                <li>• Mortgage partner referrals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Founder & Ask */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">JB</span>
              </div>
              <div>
                <p className="font-bold">Jasha Balcom</p>
                <p className="text-xs text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              22+ years in finance & real estate. Global Real Estate Advisor at Sotheby's International Realty. 
              Former professional athlete (Chicago Cubs) and Wall Street broker. Markets: Dubai, Miami, Atlanta.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" asChild>
                <a href="https://www.linkedin.com/in/jashabalcom" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" asChild>
                <a href="mailto:jasha@dubaiwealth.com">
                  <Mail className="h-3 w-3" />
                  Contact
                </a>
              </Button>
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              The Ask
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-primary-foreground/70 text-xs">Raising</p>
                <p className="text-2xl font-bold">$500K - $1M</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-primary-foreground/70">Pre-money</p>
                  <p className="font-semibold">$3M</p>
                </div>
                <div>
                  <p className="text-primary-foreground/70">Instrument</p>
                  <p className="font-semibold">SAFE</p>
                </div>
              </div>
              <p className="text-xs text-primary-foreground/70 pt-2 border-t border-primary-foreground/20">
                Use of funds: Engineering (50%), Marketing (30%), Operations (20%)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>Dubai Wealth Hub © 2025 | Confidential Investment Materials</p>
          <p className="mt-1">www.dubaiwealth.com | jasha@dubaiwealth.com</p>
        </div>
      </div>
    </div>
  );
};
