import { motion } from "framer-motion";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { label: "Academy", href: "#academy" },
      { label: "AI Assistant", href: "#" },
      { label: "Investment Tools", href: "#" },
      { label: "Property Search", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Market Reports", href: "#" },
      { label: "Off-Plan Guide", href: "#" },
      { label: "Golden Visa Info", href: "#" },
      { label: "Developer Directory", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Disclaimer", href: "#" },
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
                    <a
                      href={link.href}
                      className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
    </footer>
  );
}
