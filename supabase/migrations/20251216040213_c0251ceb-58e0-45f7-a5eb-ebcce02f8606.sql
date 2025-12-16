-- 1) Ensure Bayut property upserts work by enforcing uniqueness on (external_source, external_id)
--    If duplicates exist, keep the newest row and delete the rest.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY external_source, external_id
      ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC
    ) AS rn
  FROM public.properties
  WHERE external_source IS NOT NULL
    AND external_id IS NOT NULL
)
DELETE FROM public.properties p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS properties_external_source_external_id_uidx
  ON public.properties (external_source, external_id)
  WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

-- 2) Align bayut_agents schema with the sync function expectations
ALTER TABLE public.bayut_agents
  ADD COLUMN IF NOT EXISTS bayut_id text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

UPDATE public.bayut_agents
SET bayut_id = COALESCE(bayut_id, external_id),
    last_synced_at = COALESCE(last_synced_at, updated_at, now())
WHERE bayut_id IS NULL OR last_synced_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bayut_agents_bayut_id_uidx
  ON public.bayut_agents (bayut_id)
  WHERE bayut_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bayut_agents_last_synced_at_idx
  ON public.bayut_agents (last_synced_at DESC);

-- 3) Align bayut_agencies schema with the sync function expectations
ALTER TABLE public.bayut_agencies
  ADD COLUMN IF NOT EXISTS bayut_id text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

UPDATE public.bayut_agencies
SET bayut_id = COALESCE(bayut_id, external_id),
    last_synced_at = COALESCE(last_synced_at, updated_at, now())
WHERE bayut_id IS NULL OR last_synced_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bayut_agencies_bayut_id_uidx
  ON public.bayut_agencies (bayut_id)
  WHERE bayut_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bayut_agencies_last_synced_at_idx
  ON public.bayut_agencies (last_synced_at DESC);