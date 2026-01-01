import { Helmet } from 'react-helmet';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock';
  };
}

const BASE_URL = 'https://dubai-rei.lovable.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'Dubai Real Estate Intel';

export function SEOHead({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  article,
  product,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  
  // Truncate description to 160 chars
  const metaDescription = description.length > 160 
    ? description.slice(0, 157) + '...'
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_AE" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product specific */}
      {type === 'product' && product && (
        <>
          {product.price && (
            <>
              <meta property="product:price:amount" content={product.price.toString()} />
              <meta property="product:price:currency" content={product.currency || 'AED'} />
            </>
          )}
          {product.availability && (
            <meta property="product:availability" content={product.availability} />
          )}
        </>
      )}
      
      {/* Geographic targeting */}
      <meta name="geo.region" content="AE-DU" />
      <meta name="geo.placename" content="Dubai" />
      <meta name="geo.position" content="25.2048;55.2708" />
      <meta name="ICBM" content="25.2048, 55.2708" />
    </Helmet>
  );
}

// Pre-built SEO configurations for common pages
export const seoPresets = {
  home: {
    title: 'Dubai Real Estate Investment Platform',
    description: 'Discover exclusive Dubai real estate opportunities with AI-powered insights, market data, and expert analysis for smart property investment decisions.',
  },
  properties: {
    title: 'Dubai Properties for Sale & Investment',
    description: 'Browse premium Dubai properties for sale. Find apartments, villas, and off-plan projects with detailed market analysis and ROI projections.',
  },
  news: {
    title: 'Dubai Real Estate News & Market Updates',
    description: 'Stay updated with the latest Dubai property market news, trends, and expert analysis for informed investment decisions.',
  },
  calculators: {
    title: 'Real Estate Investment Calculators',
    description: 'Calculate ROI, rental yields, mortgage payments, and investment returns with our comprehensive Dubai real estate calculators.',
  },
  community: {
    title: 'Dubai Real Estate Investor Community',
    description: 'Connect with fellow investors, share insights, and learn from experts in our exclusive Dubai real estate community.',
  },
};
