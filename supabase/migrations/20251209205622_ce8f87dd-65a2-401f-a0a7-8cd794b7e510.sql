-- Create agent tier enum
CREATE TYPE public.agent_tier AS ENUM ('basic', 'preferred', 'premium');

-- Add subscription fields to agents table
ALTER TABLE public.agents 
ADD COLUMN subscription_tier public.agent_tier DEFAULT 'basic',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN max_listings INTEGER DEFAULT 3,
ADD COLUMN featured_listings_remaining INTEGER DEFAULT 0,
ADD COLUMN show_direct_contact BOOLEAN DEFAULT false,
ADD COLUMN priority_ranking INTEGER DEFAULT 0;

-- Create index for sorting by priority
CREATE INDEX idx_agents_priority_ranking ON public.agents(priority_ranking DESC, is_active);

-- Create index for subscription lookups
CREATE INDEX idx_agents_stripe_customer ON public.agents(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;