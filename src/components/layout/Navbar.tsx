import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, X, User, LogOut, LayoutDashboard, Settings, Heart, Building2, Users, Calendar, ChevronDown } from "lucide-react";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { useAuth } from "@/hooks/useAuth";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useConnections } from "@/hooks/useConnections";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { CurrencyPill } from "@/components/CurrencyPill";

type NavLink = {
  label: string;
  href: string;
  isRoute: boolean;
  hasBadge?: boolean;
  isUpgrade?: boolean;
  hasDropdown?: boolean;
};

const baseNavLinks: NavLink[] = [
  { label: "Academy", href: "/academy", isRoute: true },
  { label: "Properties", href: "/properties", isRoute: true, hasDropdown: true },
  { label: "Tools", href: "/tools", isRoute: true },
  { label: "Community", href: "/community", isRoute: true, hasBadge: true },
];

import { MapPin } from "lucide-react";

const propertiesDropdownItems = [
  { label: "Browse Properties", href: "/properties", description: "Explore investment opportunities", icon: Building2 },
  { label: "Neighborhoods", href: "/neighborhoods", description: "Explore Dubai areas & guides", icon: MapPin },
  { label: "Developers", href: "/developers", description: "Browse Dubai's top developers", icon: Users },
  { label: "Off-Plan Projects", href: "/properties?offplan=true", description: "Upcoming developments", icon: Calendar },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [membershipTier, setMembershipTier] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { unreadCount } = useDirectMessages();
  const { pendingCount } = useConnections();
  const { savedPropertyIds } = useSavedProperties();
  const location = useLocation();
  const savedCount = savedPropertyIds?.length || 0;

  // Determine if current page has a dark hero (homepage only)
  const isDarkHeroPage = location.pathname === '/';
  
  // Use dark text on light pages when not scrolled
  const useDarkText = !isDarkHeroPage && !isScrolled;

  // Build navLinks dynamically based on user tier
  const navLinks = (() => {
    const links = [...baseNavLinks];
    
    if (!user) {
      // Not logged in - show "Membership" → /pricing
      links.push({ label: "Membership", href: "/pricing", isRoute: true });
    } else if (membershipTier === 'free') {
      // Free tier - show "Upgrade" → /pricing
      links.push({ label: "Upgrade", href: "/pricing", isRoute: true, isUpgrade: true });
    } else if (membershipTier === 'investor') {
      // Investor tier - show "Upgrade" → /upgrade
      links.push({ label: "Upgrade", href: "/upgrade", isRoute: true, isUpgrade: true });
    }
    // Elite tier - no membership link (already at max tier)
    
    return links;
  })();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user profile for avatar and membership tier
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('avatar_url, full_name, membership_tier')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setAvatarUrl(data.avatar_url);
            setFullName(data.full_name);
            setMembershipTier(data.membership_tier);
          }
        });
    } else {
      setMembershipTier(null);
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-secondary/95 backdrop-blur-md border-b border-primary/10 shadow-lg shadow-black/5"
            : "bg-transparent"
        )}
      >
        <div className="container-luxury">
          <nav className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="group">
              <BrandLogo 
                variant={useDarkText ? "light" : "dark"} 
                size="md" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const totalBadge = link.hasBadge ? unreadCount + pendingCount : 0;
                const isActive = link.isRoute && isActiveLink(link.href);
                
                // Render Properties dropdown
                if (link.hasDropdown && link.label === 'Properties') {
                  return (
                    <NavigationMenu key={link.label}>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger 
                            className={cn(
                              "text-xs uppercase tracking-[0.15em] font-sans bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent px-0",
                              isActive 
                                ? "text-primary" 
                                : useDarkText 
                                  ? "text-foreground/80 hover:text-primary"
                                  : "text-secondary-foreground/80 hover:text-primary"
                            )}
                          >
                            {link.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[300px] gap-2 p-4">
                              {propertiesDropdownItems.map((item) => (
                                <li key={item.href}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={item.href}
                                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                                    >
                                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                                        <item.icon className="w-5 h-5 text-gold" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                                        <div className="text-xs text-muted-foreground">{item.description}</div>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  );
                }
                
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      "relative text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300",
                      link.isUpgrade
                        ? "text-gold hover:text-gold/80 font-medium"
                        : isActive 
                          ? "text-primary" 
                          : useDarkText 
                            ? "text-foreground/80 hover:text-primary"
                            : "text-secondary-foreground/80 hover:text-primary"
                    )}
                  >
                    {link.label}
                    {isActive && !link.isUpgrade && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                    {totalBadge > 0 && (
                      <Badge 
                        variant="default" 
                        className="absolute -top-2 -right-4 h-4 min-w-[16px] px-1 text-[10px] bg-gold text-primary-foreground animate-pulse-soft"
                      >
                        {totalBadge > 9 ? '9+' : totalBadge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <CurrencyPill className={useDarkText ? "border-border" : "border-secondary-foreground/20"} />
              {user ? (
                <>
                  <Link 
                    to="/properties/saved" 
                    className={cn(
                      "relative p-2 rounded-full hover:bg-muted/50 transition-colors",
                      useDarkText ? "text-foreground" : "text-secondary-foreground",
                      "hover:text-primary"
                    )}
                  >
                    <Heart className="h-5 w-5" />
                    {savedCount > 0 && (
                      <Badge 
                        variant="default" 
                        className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] bg-gold text-primary-foreground"
                      >
                        {savedCount > 9 ? '9+' : savedCount}
                      </Badge>
                    )}
                  </Link>
                  <NotificationCenter className={useDarkText ? "text-foreground" : "text-secondary-foreground"} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-all duration-200 hover:ring-2 hover:ring-gold/20">
                        <Avatar className="h-9 w-9 ring-2 ring-gold/30 transition-all duration-300 hover:ring-gold/50">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-gold/20 text-gold text-sm">
                            {fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className={cn(
                      "hover:text-primary",
                      useDarkText ? "text-foreground" : "text-secondary-foreground"
                    )}>
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
              className={cn(
                "lg:hidden p-2 transition-transform duration-200 active:scale-90",
                useDarkText ? "text-foreground" : "text-secondary-foreground"
              )}
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
            <div className="container-luxury flex flex-col gap-6 py-8">
              {navLinks.map((link, index) => {
                const isActive = link.isRoute && isActiveLink(link.href);
                const totalBadge = link.hasBadge ? unreadCount + pendingCount : 0;
                
                // Render Properties with collapsible sub-items on mobile
                if (link.hasDropdown && link.label === 'Properties') {
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <button
                        onClick={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
                        className={cn(
                          "text-2xl font-serif flex items-center gap-2 w-full text-left min-h-[48px] transition-colors",
                          "active:scale-[0.98]",
                          isActive ? "text-primary" : "text-secondary-foreground hover:text-primary"
                        )}
                      >
                        {link.label}
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform duration-300",
                          isMobilePropertiesOpen && "rotate-180"
                        )} />
                      </button>
                      
                      <AnimatePresence>
                        {isMobilePropertiesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="ml-2 space-y-2 border-l-2 border-gold/30 bg-secondary/50 rounded-r-lg py-2">
                              {propertiesDropdownItems.map((item, subIndex) => {
                                const isSubItemActive = location.pathname === item.href || 
                                  (item.href.includes('?') && location.pathname + location.search === item.href);
                                
                                return (
                                  <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.05 }}
                                  >
                                    <Link
                                      to={item.href}
                                      onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsMobilePropertiesOpen(false);
                                      }}
                                      className={cn(
                                        "flex items-center gap-3 py-2.5 px-4 min-h-[52px] rounded-r-lg transition-all duration-200",
                                        "active:scale-[0.98] active:bg-gold/15",
                                        isSubItemActive 
                                          ? "text-primary bg-gold/10 border-l-2 border-gold -ml-0.5" 
                                          : "text-secondary-foreground/80 hover:text-primary hover:bg-gold/5"
                                      )}
                                    >
                                      <span className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isSubItemActive ? "bg-gold/20" : "bg-gold/10"
                                      )}>
                                        <item.icon className={cn(
                                          "w-5 h-5 transition-colors",
                                          isSubItemActive ? "text-gold" : "text-gold/70"
                                        )} />
                                      </span>
                                      <div className="flex flex-col gap-0.5 flex-1">
                                        <span className="text-lg font-medium">{item.label}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                          {item.description}
                                        </span>
                                      </div>
                                      {isSubItemActive && (
                                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                      )}
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
                
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-2xl font-serif transition-colors block min-h-[48px] flex items-center",
                        link.isUpgrade
                          ? "text-gold hover:text-gold/80"
                          : isActive 
                            ? "text-primary" 
                            : "text-secondary-foreground hover:text-primary"
                      )}
                    >
                      {link.label}
                      {isActive && !link.isUpgrade && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary" />
                      )}
                      {totalBadge > 0 && (
                        <Badge 
                          variant="default" 
                          className="ml-2 h-5 min-w-[20px] px-1.5 text-xs bg-gold text-primary-foreground"
                        >
                          {totalBadge > 9 ? '9+' : totalBadge}
                        </Badge>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="flex flex-col gap-4 pt-6 border-t border-primary/20">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="lg" className="text-secondary-foreground justify-start w-full">
                        <User className="h-5 w-5 mr-2" />
                        My Profile
                      </Button>
                    </Link>
                    <Link to="/properties/saved" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="lg" className="text-secondary-foreground justify-start w-full">
                        <Heart className="h-5 w-5 mr-2" />
                        Saved Properties
                        {savedCount > 0 && (
                          <Badge variant="default" className="ml-2 bg-gold text-primary-foreground text-xs">
                            {savedCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" size="lg" className="text-secondary-foreground justify-start w-full">
                        <Settings className="h-5 w-5 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="hero" size="lg" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-destructive justify-start w-full"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                  </>
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
