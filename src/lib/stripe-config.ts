// Stripe product and price configuration
export const STRIPE_TIERS = {
  investor: {
    product_id: "prod_TZ38QBXp8kGx7k",
    price_id: "price_1Sbv2KHVQx2jO318h20jYHWa",
    name: "Dubai Investor",
    price: 29,
    priceDisplay: "$29",
    period: "/month",
  },
  elite: {
    product_id: "prod_TZ38flxttNDJ5W",
    price_id: "price_1Sbv2UHVQx2jO318S54njLC4",
    name: "Dubai Elite Investor",
    price: 97,
    priceDisplay: "$97",
    period: "/month",
  },
} as const;

export type SubscriptionTier = 'free' | 'investor' | 'elite';
