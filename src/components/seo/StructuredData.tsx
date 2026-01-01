import { Helmet } from 'react-helmet';

interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface PropertyData {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  address: {
    locality: string;
    region: string;
    country: string;
  };
  numberOfRooms?: number;
  floorSize?: {
    value: number;
    unitCode: string;
  };
}

interface ArticleData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Organization schema (for homepage)
export function OrganizationSchema({ data }: { data: OrganizationData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Breadcrumb schema
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Property/Real Estate schema
export function PropertySchema({ data }: { data: PropertyData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: data.name,
    description: data.description,
    image: data.image,
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: data.address.locality,
      addressRegion: data.address.region,
      addressCountry: data.address.country,
    },
    numberOfRooms: data.numberOfRooms,
    floorSize: data.floorSize
      ? {
          '@type': 'QuantitativeValue',
          value: data.floorSize.value,
          unitCode: data.floorSize.unitCode,
        }
      : undefined,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Article schema
export function ArticleSchema({ data }: { data: ArticleData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Organization',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dubai Real Estate Intel',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dubai-rei.lovable.app/logo.png',
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// FAQ schema
export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// WebSite schema with search
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dubai Real Estate Intel',
    url: 'https://dubai-rei.lovable.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://dubai-rei.lovable.app/buy?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
