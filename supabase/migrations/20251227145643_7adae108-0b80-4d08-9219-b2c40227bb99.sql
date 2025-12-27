-- Add 'private' to membership_tier enum
ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'private' AFTER 'elite';