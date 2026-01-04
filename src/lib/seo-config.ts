// Centralized SEO Configuration for Dubai Real Estate Investor
// Keywords, meta templates, and structured data generators

import { DOMAIN_CONFIG, getFullUrl, getOgImageUrl } from './domain-config';

export const SITE_CONFIG = {
  name: DOMAIN_CONFIG.siteName,
  tagline: DOMAIN_CONFIG.tagline,
  url: DOMAIN_CONFIG.baseUrl,
  logo: getOgImageUrl(),
  twitter: DOMAIN_CONFIG.twitter,
  author: DOMAIN_CONFIG.author,
  locale: DOMAIN_CONFIG.locale,
  geoRegion: DOMAIN_CONFIG.geoRegion,
  geoPlacename: DOMAIN_CONFIG.geoPlacename,
};

// Primary keyword clusters for different page types
export const KEYWORDS = {
  home: [
    'Dubai real estate investing', // Primary keyword - 9K+ monthly searches
    'Dubai real estate investment',
    'invest in Dubai property',
    'Dubai property investment platform',
    'buy property Dubai',
    'off-plan Dubai',
    'Dubai real estate AI',
    'Dubai Golden Visa property',
    'UAE property investment',
  ],
  properties: [
    'buy property in Dubai',
    'Dubai property for sale',
    'off-plan properties Dubai',
    'Dubai apartments for sale',
    'Dubai villas for sale',
    'RERA registered properties Dubai',
    'luxury properties Dubai',
    'Dubai Marina apartments',
    'Downtown Dubai property',
    'Palm Jumeirah villas',
  ],
  goldenVisa: [
    'Dubai Golden Visa property',
    'Golden Visa UAE requirements 2025',
    '10 year visa Dubai property',
    'investor visa UAE',
    'UAE residency through property',
    'Golden Visa investment Dubai',
    'Dubai long term visa',
    'property investment visa UAE',
  ],
  roiCalculator: [
    'Dubai property ROI calculator',
    'rental yield calculator Dubai',
    'Dubai investment return calculator',
    'property yield Dubai',
    'Dubai real estate ROI',
    'investment property calculator UAE',
  ],
  mortgageCalculator: [
    'Dubai mortgage calculator',
    'home loan calculator UAE',
    'UAE mortgage rates',
    'Dubai property financing',
    'mortgage calculator Emirates',
    'home loan Dubai',
  ],
  airbnbCalculator: [
    'Airbnb income Dubai',
    'short term rental yield Dubai',
    'Dubai vacation rental income',
    'STR calculator Dubai',
    'holiday home income UAE',
    'Airbnb ROI Dubai',
  ],
  rentVsBuy: [
    'rent vs buy Dubai',
    'should I buy property Dubai',
    'renting vs buying UAE',
    'Dubai property rent or buy calculator',
  ],
  academy: [
    'Dubai real estate investing course',
    'Dubai real estate investing education',
    'Dubai real estate course',
    'property investment course Dubai',
    'learn Dubai real estate',
    'investment education UAE',
    'Dubai property masterclass',
    'real estate investing course',
  ],
  tools: [
    'Dubai investment tools',
    'property calculators Dubai',
    'real estate analysis tools UAE',
    'Dubai property valuation tools',
  ],
  membership: [
    'Dubai investment membership',
    'real estate investor community',
    'Dubai property investor network',
    'investment platform membership',
  ],
};

// Page-specific SEO templates
export const PAGE_SEO = {
  home: {
    title: 'Dubai Real Estate Investing — AI-Powered Investment Platform | Dubai Wealth Hub',
    description: 'Start Dubai real estate investing with AI-powered analysis, exclusive education, and priority off-plan access. Join 12,000+ global investors building wealth in UAE.',
    keywords: KEYWORDS.home,
  },
  properties: {
    title: 'Dubai Properties for Sale — Off-Plan & Ready Properties | Dubai Wealth Hub',
    description: 'Browse RERA-registered Dubai properties including off-plan developments, luxury apartments, and villas. Compare investment yields across Dubai Marina, Downtown, Palm Jumeirah & more.',
    keywords: KEYWORDS.properties,
  },
  goldenVisa: {
    title: 'Dubai Golden Visa Through Property Investment — Requirements & Guide 2025',
    description: 'Get your 10-year UAE Golden Visa through property investment. AI-powered eligibility assessment, step-by-step process, and investment recommendations for 2025.',
    keywords: KEYWORDS.goldenVisa,
  },
  roiCalculator: {
    title: 'Dubai Property ROI Calculator — Calculate Rental Yield & Returns',
    description: 'Free Dubai property ROI calculator with all DLD fees, service charges & taxes included. Calculate net rental yield, cash-on-cash return, and total investment returns.',
    keywords: KEYWORDS.roiCalculator,
  },
  mortgageCalculator: {
    title: 'Dubai Mortgage Calculator — UAE Home Loan Calculator 2025',
    description: 'Calculate your Dubai mortgage with UAE bank rates, DLD fees, and insurance costs. Compare monthly payments and total cost of financing for property investment.',
    keywords: KEYWORDS.mortgageCalculator,
  },
  airbnbCalculator: {
    title: 'Dubai Airbnb Calculator — Short-Term Rental Yield Estimator',
    description: 'Calculate Airbnb income potential in Dubai with seasonal rates, DTCM licensing costs, and management fees. Estimate net STR yield by area and property type.',
    keywords: KEYWORDS.airbnbCalculator,
  },
  rentVsBuy: {
    title: 'Rent vs Buy Calculator Dubai — Should You Buy Property in UAE?',
    description: 'Compare the total cost of renting vs buying property in Dubai. Factor in DLD fees, appreciation, opportunity cost, and break-even timeline for your situation.',
    keywords: KEYWORDS.rentVsBuy,
  },
  tools: {
    title: 'Dubai Real Estate Investment Tools — Calculators & Analysis',
    description: 'Free Dubai property investment tools: ROI calculator, mortgage analyzer, Airbnb yield estimator, rent vs buy comparison, and Golden Visa eligibility checker.',
    keywords: KEYWORDS.tools,
  },
  academy: {
    title: 'Dubai Real Estate Investing Course — Expert-Led Education & Training',
    description: 'Master Dubai real estate investing with 50+ expert-led video lessons. Learn off-plan strategies, due diligence, market analysis, and wealth building in the UAE.',
    keywords: KEYWORDS.academy,
  },
  membership: {
    title: 'Join Dubai Wealth Hub — Investor Membership from $29/month',
    description: 'Get full access to Dubai real estate education, investment tools, AI assistant, and investor community. 30-day money-back guarantee. Cancel anytime.',
    keywords: KEYWORDS.membership,
  },
  elite: {
    title: 'Dubai Elite Investor Membership — Priority Access & AI Tools | $97/mo',
    description: 'Unlock priority off-plan allocations, AI Investment Blueprint Generator, portfolio tracking, elite community access, and direct expert consultation.',
    keywords: [...KEYWORDS.membership, 'elite investor', 'priority allocations', 'AI investment tools'],
  },
  pricing: {
    title: 'Pricing — Dubai Wealth Hub Membership Plans',
    description: 'Compare Dubai Wealth Hub membership tiers: Free, Dubai Investor ($29/mo), and Dubai Elite ($97/mo). Choose your investment path with 30-day money-back guarantee.',
    keywords: KEYWORDS.membership,
  },
  contact: {
    title: 'Contact Us — Dubai Wealth Hub Support',
    description: 'Get in touch with Dubai Wealth Hub. Questions about membership, property investment, or partnership opportunities? Our team is here to help.',
    keywords: ['contact Dubai Wealth Hub', 'real estate investment support', 'Dubai property help'],
  },
  dashboard: {
    title: 'Dashboard — Dubai Wealth Hub',
    description: 'Your personal Dubai real estate investment dashboard. Track portfolio, access tools, and get AI-powered insights.',
    keywords: ['investment dashboard', 'portfolio tracker', 'Dubai property dashboard'],
  },
  aiAssistant: {
    title: 'AI Investment Assistant — Dubai Wealth Hub',
    description: 'Get personalized Dubai real estate investment advice powered by AI. Ask questions about properties, market trends, Golden Visa, and investment strategies.',
    keywords: ['AI investment assistant', 'Dubai property AI', 'real estate chatbot', 'investment advisor AI'],
  },
};

// Structured Data Generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: SITE_CONFIG.logo,
  description: 'AI-powered Dubai real estate investment platform with education, tools, and community for global investors.',
  sameAs: [
    `https://twitter.com/${SITE_CONFIG.twitter.replace('@', '')}`,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
});

export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_CONFIG.url}/properties?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const generateCourseSchema = (course: {
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration?: number;
  level?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.title,
  description: course.description,
  provider: {
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
  },
  image: course.thumbnailUrl,
  educationalLevel: course.level || 'Beginner to Advanced',
  timeRequired: course.duration ? `PT${course.duration}M` : undefined,
});

export const generateRealEstateListingSchema = (property: {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  images?: string[];
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: property.title,
  description: property.description,
  url: property.url,
  image: property.images?.[0],
  address: {
    '@type': 'PostalAddress',
    addressLocality: property.location,
    addressRegion: 'Dubai',
    addressCountry: 'AE',
  },
  offers: {
    '@type': 'Offer',
    price: property.price,
    priceCurrency: property.currency || 'AED',
  },
  numberOfRooms: property.bedrooms,
  numberOfBathroomsTotal: property.bathrooms,
  floorSize: property.size ? {
    '@type': 'QuantitativeValue',
    value: property.size,
    unitCode: 'FTK', // Square feet
  } : undefined,
});

export const generateSoftwareApplicationSchema = (tool: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: tool.name,
  description: tool.description,
  url: tool.url,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
