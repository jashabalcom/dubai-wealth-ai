// Stripe product and price configuration - Dubai REI
export const STRIPE_PUBLISHABLE_KEY = "pk_live_51Sd1LOHw4VrnO885zMga1jd8B6S2KKnx5EHj9or0EF2QrnIkN2BQztwDSUhOQlcOTxVykYYEORhNPNzJHYKYCvKA00TwrVgzBR";

export const STRIPE_TIERS = {
  investor: {
    product_id: "prod_ThxMtreIVfefZK",
    monthly: {
      price_id: "price_1SkXRkHw4VrnO885MoTLD6iC",
      price: 29,
      priceDisplay: "$29",
      period: "/month",
    },
    annual: {
      price_id: "price_1SkXRwHw4VrnO885DWKPmskP",
      price: 290,
      priceDisplay: "$290",
      monthlyEquivalent: "$24",
      period: "/year",
      savings: 58,
      savingsDisplay: "Save $58",
    },
    name: "Dubai Investor",
  },
  elite: {
    product_id: "prod_ThxMsDNaQxY8bp",
    monthly: {
      price_id: "price_1SkXS8Hw4VrnO885hyP39hIh",
      price: 97,
      priceDisplay: "$97",
      period: "/month",
    },
    annual: {
      price_id: "price_1SkXSKHw4VrnO885KvdKUvGE",
      price: 970,
      priceDisplay: "$970",
      monthlyEquivalent: "$81",
      period: "/year",
      savings: 194,
      savingsDisplay: "Save $194",
    },
    name: "Dubai Elite",
  },
  private: {
    product_id: "prod_ThxN30jXTwBfoE",
    monthly: {
      price_id: "price_1SkXSWHw4VrnO885DzNEfjAu",
      price: 149,
      priceDisplay: "$149",
      period: "/month",
    },
    annual: {
      price_id: "price_1SkXShHw4VrnO885j5BkoDu4",
      price: 1500,
      priceDisplay: "$1,500",
      monthlyEquivalent: "$125",
      period: "/year",
      savings: 288,
      savingsDisplay: "Save $288",
    },
    name: "Dubai Private",
  },
} as const;

export type SubscriptionTier = 'free' | 'investor' | 'elite' | 'private';
export type BillingPeriod = 'monthly' | 'annual';
