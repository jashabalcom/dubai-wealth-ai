// Bayut API Data Transformation Utilities
// Maps Bayut API response fields to our properties table schema

export interface BayutProperty {
  id: number;
  externalID: string;
  title: string;
  title_l1?: string;
  price: number;
  rentFrequency?: string;
  rooms?: string;
  baths?: number;
  area: number; // in sqft
  coverPhoto?: {
    id: number;
    externalID: string;
    title: string;
    url: string;
  };
  photoCount?: number;
  photos?: Array<{
    id: number;
    externalID: string;
    title: string;
    url: string;
  }>;
  videoCount?: number;
  panoramaCount?: number;
  phoneNumber?: {
    mobile: string;
    phone: string;
    whatsapp?: string;
  };
  contactName?: string;
  agency?: {
    id: number;
    name: string;
    name_l1?: string;
    logo?: { url: string };
  };
  hash?: string;
  keywords?: string[];
  isVerified?: boolean;
  verification?: {
    status: string;
    eligible: boolean;
    updatedAt: number;
  };
  completionStatus?: string; // 'completed' or 'off_plan'
  randBoostScore?: number;
  floorPlanID?: number;
  furnishingStatus?: string;
  type?: string;
  purpose?: string; // 'for-sale' or 'for-rent'
  projectNumber?: string;
  permitNumber?: string;
  referenceNumber?: string;
  description?: string;
  description_l1?: string;
  amenities?: string[];
  geography?: {
    lat: number;
    lng: number;
  };
  location?: Array<{
    id: number;
    level: number;
    externalID: string;
    name: string;
    name_l1?: string;
    slug: string;
    slug_l1?: string;
  }>;
  category?: Array<{
    id: number;
    level: number;
    externalID: string;
    name: string;
    nameSingular?: string;
    slug: string;
  }>;
  createdAt?: number;
  updatedAt?: number;
  reactivatedAt?: number;
  ownerID?: number;
  isActiveAgent?: boolean;
  state?: string;
  product?: string;
  productLabel?: string;
}

export interface TransformedProperty {
  external_id: string;
  external_source: 'bayut';
  external_url: string;
  title: string;
  description: string | null;
  price_aed: number;
  size_sqft: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  listing_type: 'sale' | 'rent';
  location_area: string;
  latitude: number | null;
  longitude: number | null;
  is_off_plan: boolean;
  furnishing: string | null;
  rera_permit_number: string | null;
  amenities: string[];
  images: string[]; // Will be populated after photo re-hosting
  last_synced_at: string;
  is_published: boolean;
  slug: string;
}

// Dubai areas mapping for Bayut location IDs
export const DUBAI_AREAS = [
  { name: 'Dubai Marina', slug: 'dubai-marina', bayutId: '5002' },
  { name: 'Downtown Dubai', slug: 'downtown-dubai', bayutId: '6901' },
  { name: 'Palm Jumeirah', slug: 'palm-jumeirah', bayutId: '5548' },
  { name: 'Business Bay', slug: 'business-bay', bayutId: '6588' },
  { name: 'Jumeirah Village Circle', slug: 'jumeirah-village-circle', bayutId: '6357' },
  { name: 'Jumeirah Lake Towers', slug: 'jumeirah-lake-towers', bayutId: '5549' },
  { name: 'Dubai Hills Estate', slug: 'dubai-hills-estate', bayutId: '9262' },
  { name: 'Arabian Ranches', slug: 'arabian-ranches', bayutId: '5003' },
  { name: 'DIFC', slug: 'difc', bayutId: '6599' },
  { name: 'Jumeirah Beach Residence', slug: 'jumeirah-beach-residence', bayutId: '5550' },
  { name: 'Dubai Sports City', slug: 'dubai-sports-city', bayutId: '5004' },
  { name: 'Dubai Silicon Oasis', slug: 'dubai-silicon-oasis', bayutId: '6374' },
  { name: 'Al Barsha', slug: 'al-barsha', bayutId: '5318' },
  { name: 'Meydan City', slug: 'meydan-city', bayutId: '8124' },
  { name: 'Creek Harbour', slug: 'creek-harbour', bayutId: '10817' },
];

/**
 * Extract the primary location area from Bayut location array
 */
export function extractLocationArea(location?: BayutProperty['location']): string {
  if (!location || location.length === 0) return 'Dubai';
  
  // Find the community level (usually level 1 or 2)
  const community = location.find(loc => loc.level === 1 || loc.level === 2);
  return community?.name || location[0]?.name || 'Dubai';
}

/**
 * Extract property type from Bayut category
 */
export function extractPropertyType(category?: BayutProperty['category']): string {
  if (!category || category.length === 0) return 'apartment';
  
  const typeMap: Record<string, string> = {
    'apartment': 'apartment',
    'villa': 'villa',
    'townhouse': 'townhouse',
    'penthouse': 'penthouse',
    'duplex': 'duplex',
    'studio': 'studio',
    'land': 'land',
    'office': 'commercial',
    'shop': 'commercial',
    'warehouse': 'commercial',
  };
  
  const categoryName = category[0]?.slug?.toLowerCase() || '';
  return typeMap[categoryName] || 'apartment';
}

/**
 * Parse bedrooms from Bayut rooms string
 */
export function parseBedrooms(rooms?: string): number {
  if (!rooms) return 0;
  if (rooms.toLowerCase() === 'studio') return 0;
  const num = parseInt(rooms, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Generate a unique slug from property data
 */
export function generateSlug(title: string, externalId: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  return `${baseSlug}-${externalId}`;
}

/**
 * Transform a Bayut API property to our schema
 */
export function transformBayutProperty(bayutProperty: BayutProperty): TransformedProperty {
  const externalId = bayutProperty.externalID || String(bayutProperty.id);
  const title = bayutProperty.title || 'Property';
  
  return {
    external_id: externalId,
    external_source: 'bayut',
    external_url: `https://www.bayut.com/property/${externalId}`,
    title,
    description: bayutProperty.description || null,
    price_aed: bayutProperty.price || 0,
    size_sqft: Math.round(bayutProperty.area || 0),
    bedrooms: parseBedrooms(bayutProperty.rooms),
    bathrooms: bayutProperty.baths || 0,
    property_type: extractPropertyType(bayutProperty.category),
    listing_type: bayutProperty.purpose === 'for-rent' ? 'rent' : 'sale',
    location_area: extractLocationArea(bayutProperty.location),
    latitude: bayutProperty.geography?.lat || null,
    longitude: bayutProperty.geography?.lng || null,
    is_off_plan: bayutProperty.completionStatus === 'off_plan',
    furnishing: bayutProperty.furnishingStatus || null,
    rera_permit_number: bayutProperty.permitNumber || null,
    amenities: bayutProperty.amenities || [],
    images: [], // Will be populated after photo re-hosting
    last_synced_at: new Date().toISOString(),
    is_published: false, // Start unpublished for admin review
    slug: generateSlug(title, externalId),
  };
}

/**
 * Extract photo URLs from Bayut property for re-hosting
 */
export function extractPhotoUrls(bayutProperty: BayutProperty): string[] {
  const urls: string[] = [];
  
  // Add cover photo first
  if (bayutProperty.coverPhoto?.url) {
    urls.push(bayutProperty.coverPhoto.url);
  }
  
  // Add additional photos
  if (bayutProperty.photos) {
    for (const photo of bayutProperty.photos) {
      if (photo.url && !urls.includes(photo.url)) {
        urls.push(photo.url);
      }
    }
  }
  
  // Limit to 10 photos to conserve storage
  return urls.slice(0, 10);
}
