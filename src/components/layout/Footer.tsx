import { motion } from "framer-motion";

import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "AI Assistant", href: "/ai-assistant" },
      { label: "Investment Tools", href: "/tools" },
      { label: "Property Search", href: "/properties" },
      { label: "Community", href: "/community" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Market Reports", href: "#" },
      { label: "Off-Plan Guide", href: "#" },
      { label: "Golden Visa Wizard", href: "/golden-visa" },
      { label: "Developer Directory", href: "/developers" },
      { label: "Blog", href: "#" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "#" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container-luxury py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex flex-col items-start mb-6">
              <span className="font-serif text-2xl font-semibold text-secondary-foreground tracking-wide">
                Dubai Wealth Hub
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-sans">
                by Balcom Privé
              </span>
            </a>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6 max-w-sm">
              An AI-powered Dubai real estate wealth platform for global investors. 
              Education, tools, community, and exclusive deal flow — all in one place.
            </p>
            <div className="flex gap-4">
              {["LinkedIn", "Twitter", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full border border-secondary-foreground/20 flex items-center justify-center text-secondary-foreground/60 hover:text-primary hover:border-primary transition-colors text-xs"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-xs uppercase tracking-[0.2em] text-primary font-sans mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Disclaimer */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container-luxury py-8">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary-foreground/5 border border-secondary-foreground/10">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-secondary-foreground/80 font-medium">
                Education & Referral Platform
              </p>
              <p className="text-xs text-secondary-foreground/60 leading-relaxed">
                Dubai Wealth Hub is an educational platform and referral network. We are not a licensed real estate brokerage. 
                Properties are presented by licensed RERA-registered agents and developers. All investment analysis, 
                projections, and AI-generated content are for educational purposes only and do not constitute financial, 
                legal, or investment advice. Past performance does not guarantee future results.{' '}
                <Link to="/disclaimer" className="text-primary hover:underline">
                  Read full disclaimer
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container-luxury py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/40 text-sm">
            © {new Date().getFullYear()} Dubai Wealth Hub by Balcom Privé. All rights reserved.
          </p>
          <p className="text-secondary-foreground/40 text-sm">
            Dubai, United Arab Emirates
          </p>
        </div>
      </div>

      {/* Agency Credit */}
      <div className="border-t border-secondary-foreground/5">
        <div className="container-luxury py-4 flex items-center justify-center">
          <a 
            href="https://www.majorleadsagency.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-secondary-foreground/30 hover:text-secondary-foreground/50 transition-colors group"
          >
            <span className="text-xs tracking-wide">Built by</span>
            <img 
              src="/images/mla-logo.png" 
              alt="Major Leads Agency" 
              className="h-4 opacity-40 group-hover:opacity-60 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
