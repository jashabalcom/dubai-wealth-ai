// Agent subscription tier configuration
export const AGENT_TIERS = {
  basic: {
    name: 'Basic',
    price: 0,
    priceDisplay: 'Free',
    max_listings: 3,
    featured_listings: 0,
    show_direct_contact: false,
    priority_ranking: 0,
    badge: null,
    badgeColor: null,
    features: [
      'Up to 3 property listings',
      'Basic profile visibility',
      'Inquiries routed through platform',
    ],
  },
  preferred: {
    name: 'Preferred Agent',
    price: 99,
    priceDisplay: '$99/mo',
    product_id: 'prod_TZhJGjhivFcpVY',
    price_id: 'price_1ScXvBHVQx2jO318v8WitXfw',
    max_listings: 15,
    featured_listings: 2,
    show_direct_contact: true,
    priority_ranking: 50,
    badge: 'Preferred',
    badgeColor: 'bg-blue-500',
    features: [
      'Up to 15 property listings',
      '2 featured listing slots',
      'Direct contact info displayed',
      'Priority placement in search',
      'Preferred Agent badge',
    ],
  },
  premium: {
    name: 'Premium Partner',
    price: 299,
    priceDisplay: '$299/mo',
    product_id: 'prod_TZhLz1WYAlbzui',
    price_id: 'price_1ScXwfHVQx2jO318hxW3m0t3',
    max_listings: -1, // Unlimited
    featured_listings: 10,
    show_direct_contact: true,
    priority_ranking: 100,
    badge: 'Premium Partner',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    features: [
      'Unlimited property listings',
      '10 featured listing slots',
      'Direct contact info displayed',
      'Top priority placement',
      'Premium Partner badge',
      'Featured in agent directory',
    ],
  },
} as const;

export type AgentTier = keyof typeof AGENT_TIERS;

export const AGENT_TIER_PRODUCT_MAP: Record<string, AgentTier> = {
  'prod_TZhJGjhivFcpVY': 'preferred',
  'prod_TZhLz1WYAlbzui': 'premium',
};

export function getAgentTierFromProductId(productId: string | null): AgentTier {
  if (!productId) return 'basic';
  return AGENT_TIER_PRODUCT_MAP[productId] || 'basic';
}

export function getListingLimit(tier: AgentTier): number | null {
  const config = AGENT_TIERS[tier];
  return config.max_listings === -1 ? null : config.max_listings;
}

export function canAddMoreListings(tier: AgentTier, currentCount: number): boolean {
  const limit = getListingLimit(tier);
  if (limit === null) return true; // Unlimited
  return currentCount < limit;
}
