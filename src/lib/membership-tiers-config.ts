import { Crown, Zap, Star, Shield, Phone } from "lucide-react";

// Centralized membership tier configuration - Single source of truth
export const MEMBERSHIP_TIERS = {
  free: {
    id: 'free' as const,
    name: "Free",
    price: 0,
    priceDisplay: "$0",
    period: "forever",
    description: "Explore Dubai real estate basics and community access.",
    shortDescription: "Explore Dubai real estate basics",
    features: [
      "Limited market reports",
      "Basic community access",
      "Property listings browser",
      "Newsletter & updates",
    ],
    cta: "Get Started",
    highlighted: false,
    badge: null,
    icon: Star,
  },
  investor: {
    id: 'investor' as const,
    name: "Dubai Investor",
    price: 29,
    priceDisplay: "$29",
    period: "/month",
    annualPrice: 290,
    annualPriceDisplay: "$290",
    annualMonthlyEquivalent: "$24",
    annualSavings: "$58",
    product_id: "prod_TZ38QBXp8kGx7k",
    price_id: "price_1Sbv2KHVQx2jO318h20jYHWa",
    annual_price_id: "price_1ShQ9DHVQx2jO318EopokNIq",
    description: "Full access to education, tools, and community for serious investors.",
    shortDescription: "Everything you need to invest confidently",
    features: [
      "Full Academy access (50+ video lessons)",
      "6 Investment Calculators with AI Analysis",
      "Property comparison tool (up to 4)",
      "Save & track favorite properties",
      "Core community channels",
      "Member directory & networking",
      "Direct messaging with connections",
      "Monthly market reports",
      "Basic AI Investment Assistant",
      "Off-plan project browser",
      "PDF export for all reports",
      "Email support",
    ],
    cta: "Become an Investor",
    highlighted: true,
    badge: "Recommended",
    icon: Zap,
  },
  elite: {
    id: 'elite' as const,
    name: "Dubai Elite",
    price: 97,
    priceDisplay: "$97",
    period: "/month",
    annualPrice: 970,
    annualPriceDisplay: "$970",
    annualMonthlyEquivalent: "$81",
    annualSavings: "$194",
    product_id: "prod_TZ38flxttNDJ5W",
    price_id: "price_1Sbv2UHVQx2jO318S54njLC4",
    annual_price_id: "price_1ShQ9OHVQx2jO318x9l7kYEV",
    description: "Advanced AI tools, priority access, and elite networking for wealth builders.",
    shortDescription: "Maximum returns with exclusive access",
    features: [
      "Everything in Dubai Investor, plus:",
      "Golden Visa Investment Wizard (AI)",
      "AI Investment Blueprint Generator",
      "AI Property Analysis (comparables)",
      "AI Dashboard Insights (personalized)",
      "Portfolio tracking dashboard",
      "Elite-only community & Deal Room",
      "Priority off-plan allocations",
      "Weekly market intelligence reports",
      "Monthly live investor calls",
      "Direct expert consultation (24hr response)",
      "Elite badge on profile",
    ],
    cta: "Go Elite",
    highlighted: false,
    badge: "Best Value",
    icon: Crown,
  },
  private: {
    id: 'private' as const,
    name: "Dubai Private",
    price: 149,
    priceDisplay: "$149",
    period: "/month",
    annualPrice: 1500,
    annualPriceDisplay: "$1,500",
    annualMonthlyEquivalent: "$125",
    annualSavings: "$288",
    product_id: "prod_TgMfiaX6U5k905",
    price_id: "price_1SizvrHVQx2jO318FYaOxTqr",
    annual_price_id: "price_1SizwHHVQx2jO318PaFBNJmX",
    description: "You now have a team in Dubai. High-touch advisory and concierge services.",
    shortDescription: "Your dedicated team in Dubai",
    features: [
      "Everything in Dubai Elite, plus:",
      "Dedicated concierge & sourcing",
      "Priority deal access (48-72hr early)",
      "Direct advisory support",
      "Off-market opportunities",
      "Personalized investment strategy",
      "Quarterly portfolio reviews",
      "Priority response (same-day)",
      "White-glove transaction support",
    ],
    cta: "Request Private Access",
    highlighted: false,
    badge: "Concierge",
    icon: Shield,
  },
} as const;

// Feature comparison for pricing tables
export const FEATURE_COMPARISON = [
  // Education & Learning
  { category: "Education", feature: "Academy Courses (50+ lessons)", free: false, investor: true, elite: true, private: true },
  { category: "Education", feature: "Video Lessons & Resources", free: false, investor: true, elite: true, private: true },
  { category: "Education", feature: "Progress Tracking", free: false, investor: true, elite: true, private: true },
  
  // Investment Tools
  { category: "Tools", feature: "ROI Calculator", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "Mortgage Calculator", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "Airbnb Yield Calculator", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "Rent vs Buy Calculator", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "STR vs LTR Comparison", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "Total Cost of Ownership", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "AI Calculator Analysis", free: false, investor: true, elite: true, private: true },
  { category: "Tools", feature: "PDF Export", free: false, investor: true, elite: true, private: true },
  
  // Properties
  { category: "Properties", feature: "Property Listings Browser", free: true, investor: true, elite: true, private: true },
  { category: "Properties", feature: "Save Favorite Properties", free: false, investor: true, elite: true, private: true },
  { category: "Properties", feature: "Property Comparison (4 properties)", free: false, investor: true, elite: true, private: true },
  { category: "Properties", feature: "Off-Plan Project Browser", free: false, investor: true, elite: true, private: true },
  { category: "Properties", feature: "Priority Off-Plan Allocations", free: false, investor: false, elite: true, private: true },
  { category: "Properties", feature: "AI Property Analysis", free: false, investor: false, elite: true, private: true },
  { category: "Properties", feature: "Off-Market Opportunities", free: false, investor: false, elite: false, private: true },
  
  // Community
  { category: "Community", feature: "Basic Community Access", free: true, investor: true, elite: true, private: true },
  { category: "Community", feature: "Core Community Channels", free: false, investor: true, elite: true, private: true },
  { category: "Community", feature: "Member Directory", free: false, investor: true, elite: true, private: true },
  { category: "Community", feature: "Direct Messaging", free: false, investor: true, elite: true, private: true },
  { category: "Community", feature: "Elite-Only Deal Room", free: false, investor: false, elite: true, private: true },
  
  // AI Features
  { category: "AI", feature: "Basic AI Assistant", free: false, investor: true, elite: true, private: true },
  { category: "AI", feature: "AI Dashboard Insights", free: false, investor: false, elite: true, private: true },
  { category: "AI", feature: "AI Investment Blueprint Generator", free: false, investor: false, elite: true, private: true },
  { category: "AI", feature: "Golden Visa Wizard (AI)", free: false, investor: false, elite: true, private: true },
  
  // Portfolio & Tracking
  { category: "Portfolio", feature: "Dashboard Summary", free: false, investor: true, elite: true, private: true },
  { category: "Portfolio", feature: "Portfolio Tracking Dashboard", free: false, investor: false, elite: true, private: true },
  { category: "Portfolio", feature: "Multi-Property Analytics", free: false, investor: false, elite: true, private: true },
  
  // Support & Concierge
  { category: "Support", feature: "Monthly Market Reports", free: false, investor: true, elite: true, private: true },
  { category: "Support", feature: "Weekly Market Intelligence", free: false, investor: false, elite: true, private: true },
  { category: "Support", feature: "Monthly Live Investor Calls", free: false, investor: false, elite: true, private: true },
  { category: "Support", feature: "Email Support", free: false, investor: true, elite: true, private: true },
  { category: "Support", feature: "Direct Expert Consultation", free: false, investor: false, elite: true, private: true },
  { category: "Support", feature: "Elite Badge on Profile", free: false, investor: false, elite: true, private: true },
  { category: "Support", feature: "Dedicated Concierge", free: false, investor: false, elite: false, private: true },
  { category: "Support", feature: "Same-Day Priority Response", free: false, investor: false, elite: false, private: true },
  { category: "Support", feature: "White-Glove Transaction Support", free: false, investor: false, elite: false, private: true },
];

// Testimonials for pricing page
export const PRICING_TESTIMONIALS = [
  {
    quote: "The calculators alone saved me from a bad investment. The AI analysis caught issues I would have missed.",
    author: "David Chen",
    role: "First-Time Investor",
    tier: "investor" as const,
    avatar: null,
  },
  {
    quote: "The Elite membership paid for itself within the first month. The off-plan deal I got access to has already appreciated 15%.",
    author: "Marcus Chen",
    role: "Portfolio Manager",
    investment: "$1.2M+ Portfolio",
    tier: "elite" as const,
    avatar: null,
  },
  {
    quote: "Having a dedicated team in Dubai changed everything. The Private concierge found me an off-market villa I never would have discovered.",
    author: "James Mitchell",
    role: "HNWI Expat",
    investment: "$2.5M+ Portfolio",
    tier: "private" as const,
    avatar: null,
  },
];

// Private exclusive features with descriptions
export const PRIVATE_EXCLUSIVE_FEATURES = [
  {
    icon: Shield,
    title: "Dedicated Concierge",
    description: "Your personal team handles sourcing, due diligence, and transaction support.",
  },
  {
    icon: Phone,
    title: "Same-Day Response",
    description: "Priority access to investment advisors with guaranteed same-day response.",
  },
  {
    icon: Crown,
    title: "Off-Market Access",
    description: "Exclusive access to properties and deals not available to the public.",
  },
];

// Elite exclusive features with descriptions (kept for backward compatibility)
export const ELITE_EXCLUSIVE_FEATURES = [
  {
    icon: Crown,
    title: "Priority Off-Plan Access",
    description: "Get first access to exclusive off-plan launches 48-72 hours before public release.",
  },
  {
    icon: Zap,
    title: "AI Investment Blueprint",
    description: "Personalized investment strategies based on your goals, budget, and timeline.",
  },
  {
    icon: Crown,
    title: "Elite Deal Room",
    description: "Private community for exclusive deals and co-investment opportunities.",
  },
];

export type MembershipTierId = 'free' | 'investor' | 'elite' | 'private';
