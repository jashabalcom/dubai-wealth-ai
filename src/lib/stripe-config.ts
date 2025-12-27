// Stripe product and price configuration
export const STRIPE_PUBLISHABLE_KEY = "pk_live_51LhLUlHDoJDchB5lnxVmeb2NMNCepgzaROqmc7Dh9sE8JUP7PUL13Koeidi8y4x0dpgjJkgqxflieihGfwPnpAa600TVkjPUWc";

export const STRIPE_TIERS = {
  investor: {
    product_id: "prod_TZ38QBXp8kGx7k",
    monthly: {
      price_id: "price_1Sbv2KHVQx2jO318h20jYHWa",
      price: 29,
      priceDisplay: "$29",
      period: "/month",
    },
    annual: {
      price_id: "price_1ShQ9DHVQx2jO318EopokNIq",
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
    product_id: "prod_TZ38flxttNDJ5W",
    monthly: {
      price_id: "price_1Sbv2UHVQx2jO318S54njLC4",
      price: 97,
      priceDisplay: "$97",
      period: "/month",
    },
    annual: {
      price_id: "price_1ShQ9OHVQx2jO318x9l7kYEV",
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
    // NOTE: These price IDs need to be created in Stripe dashboard
    // Create a product called "Dubai Private" with:
    // - Monthly price: $149/month
    // - Annual price: $1,500/year
    product_id: "prod_private_placeholder",
    monthly: {
      price_id: "price_private_monthly_placeholder",
      price: 149,
      priceDisplay: "$149",
      period: "/month",
    },
    annual: {
      price_id: "price_private_annual_placeholder",
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
