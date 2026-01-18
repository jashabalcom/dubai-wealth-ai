import { Helmet } from "react-helmet";

interface NewsArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  url: string;
  articleSection?: string;
}

/**
 * NewsArticleSchema for market news and time-sensitive content
 * Enhances visibility in Google News and Top Stories carousel
 */
export function NewsArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName = "Dubai Real Estate Investor",
  publisherName = "Dubai Real Estate Investor",
  publisherLogo = "https://dubairealestateinvestor.com/images/mla-logo.png",
  url,
  articleSection,
}: NewsArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    image: image || undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(articleSection && { articleSection }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
