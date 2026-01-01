import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { CookiePreferencesManager } from "@/components/CookiePreferences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getFooterLinks = (t: (key: string) => string) => ({
  platform: {
    title: t('footer.platform'),
    links: [
      { label: t('footer.academy'), href: "/academy" },
      { label: t('footer.aiAssistant'), href: "/ai-assistant" },
      { label: t('footer.investmentTools'), href: "/tools" },
      { label: t('footer.propertySearch'), href: "/properties" },
      { label: t('footer.neighborhoods'), href: "/neighborhoods" },
      { label: t('footer.community'), href: "/community" },
    ],
  },
  resources: {
    title: t('footer.resources'),
    links: [
      { label: "Daily Briefing", href: "/briefing" },
      { label: t('footer.marketReports'), href: "#" },
      { label: t('footer.offPlanGuide'), href: "#" },
      { label: t('footer.goldenVisaWizard'), href: "/golden-visa" },
      { label: t('footer.developerDirectory'), href: "/developers" },
      { label: t('footer.blog'), href: "/blog" },
    ],
  },
  company: {
    title: t('footer.company'),
    links: [
      { label: t('footer.about'), href: "/about" },
      { label: t('footer.contact'), href: "/contact" },
      { label: t('footer.forAgents'), href: "/agent-portal" },
      { label: t('footer.becomeAffiliate'), href: "/affiliate" },
      { label: t('footer.careers'), href: "#" },
      { label: t('footer.partners'), href: "#" },
    ],
  },
  legal: {
    title: t('footer.legal'),
    links: [
      { label: t('footer.privacyPolicy'), href: "/privacy" },
      { label: t('footer.termsOfService'), href: "/terms" },
      { label: t('footer.cookiePolicy'), href: "/cookie-policy" },
      { label: t('footer.disclaimer'), href: "/disclaimer" },
      { label: "Manage Cookies", href: "#manage-cookies", action: "manageCookies" },
    ],
  },
});

export function Footer() {
  const { t } = useTranslation();
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);
  const footerLinks = getFooterLinks(t);

  const handleLinkClick = (link: { label: string; href: string; action?: string }) => {
    if (link.action === "manageCookies") {
      setShowCookiePrefs(true);
      return false;
    }
    return true;
  };
  
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container-luxury py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-6 group">
              <BrandLogo variant="dark" size="lg" />
            </Link>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.description')}
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
                    {(link as { action?: string }).action === "manageCookies" ? (
                      <button
                        onClick={() => handleLinkClick(link as { label: string; href: string; action?: string })}
                        className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith('/') ? (
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
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 rtl:ml-3 rtl:mr-0" />
            <div className="space-y-2">
              <p className="text-sm text-secondary-foreground/80 font-medium">
                {t('footer.disclaimerTitle')}
              </p>
              <p className="text-xs text-secondary-foreground/60 leading-relaxed">
                {t('footer.disclaimerText')}{' '}
                <Link to="/disclaimer" className="text-primary hover:underline">
                  {t('footer.readFullDisclaimer')}
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
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <p className="text-secondary-foreground/40 text-sm">
            {t('footer.location')}
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

      {/* Cookie Preferences Dialog */}
      <Dialog open={showCookiePrefs} onOpenChange={setShowCookiePrefs}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
          </DialogHeader>
          <CookiePreferencesManager 
            variant="inline" 
            onSave={() => setShowCookiePrefs(false)} 
          />
        </DialogContent>
      </Dialog>
    </footer>
  );
}
