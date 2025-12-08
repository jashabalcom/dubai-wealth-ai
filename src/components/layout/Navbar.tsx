import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Academy", href: "/academy", isRoute: true },
  { label: "Properties", href: "/properties", isRoute: true },
  { label: "Tools", href: "/tools", isRoute: true },
  { label: "Why Dubai", href: "#why-dubai", isRoute: false },
  { label: "Membership", href: "#membership", isRoute: false },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-secondary/95 backdrop-blur-md border-b border-primary/10"
            : "bg-transparent"
        }`}
      >
        <div className="container-luxury">
          <nav className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-start">
              <span className="font-serif text-xl md:text-2xl font-semibold text-secondary-foreground tracking-wide">
                Dubai Wealth Hub
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-primary font-sans">
                by Balcom Privé
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/80 hover:text-primary transition-colors duration-300 font-sans"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs uppercase tracking-[0.15em] text-secondary-foreground/80 hover:text-primary transition-colors duration-300 font-sans"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="hero" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-secondary-foreground hover:text-primary">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-secondary-foreground"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-secondary pt-24 lg:hidden"
          >
            <div className="container-luxury flex flex-col gap-8 py-8">
              {navLinks.map((link, index) => (
                link.isRoute ? (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-serif text-secondary-foreground hover:text-primary transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif text-secondary-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </motion.a>
                )
              ))}
              <div className="flex flex-col gap-4 pt-8 border-t border-primary/20">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="hero" size="lg" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="lg" className="text-secondary-foreground justify-start w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="hero" size="lg" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
