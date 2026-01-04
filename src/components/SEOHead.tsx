import { Helmet } from 'react-helmet';
import { SITE_CONFIG, generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo-config';
import { getOgImageUrl } from '@/lib/domain-config';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  structuredData?: object | object[];
  children?: React.ReactNode;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false,
  structuredData,
  children,
}: SEOHeadProps) {
  const defaultOgImage = getOgImageUrl();
  const fullTitle = title.includes(SITE_CONFIG.name) ? title : `${title} | ${SITE_CONFIG.name}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_CONFIG.url);
  
  // Combine multiple structured data objects if provided
  const allStructuredData = Array.isArray(structuredData) 
    ? structuredData 
    : structuredData 
    ? [structuredData] 
    : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="author" content={SITE_CONFIG.author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language & Region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content={SITE_CONFIG.geoRegion} />
      <meta name="geo.placename" content={SITE_CONFIG.geoPlacename} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      
      {children}
    </Helmet>
  );
}

// Pre-configured SEO component for the homepage
export function HomePageSEO() {
  return (
    <SEOHead
      title={`Dubai Real Estate Investing — AI-Powered Investment Platform | ${SITE_CONFIG.name}`}
      description="Start Dubai real estate investing with AI-powered analysis, exclusive education, and priority off-plan access. Join 12,000+ global investors building wealth in UAE."
      keywords={[
        'Dubai real estate investors',
        'Dubai real estate investing',
        'Dubai real estate investment',
        'invest in Dubai property',
        'buy property Dubai',
        'off-plan Dubai',
        'Dubai Golden Visa property',
        'UAE property investment',
        'Dubai real estate AI',
      ]}
      canonical={SITE_CONFIG.url}
      structuredData={[
        generateOrganizationSchema(),
        generateWebsiteSchema(),
      ]}
    />
  );
}
