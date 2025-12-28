-- Add investor_intent column to email_subscribers table
ALTER TABLE public.email_subscribers 
ADD COLUMN IF NOT EXISTS investor_intent text DEFAULT NULL;

-- Add constraint for valid intent values
ALTER TABLE public.email_subscribers
ADD CONSTRAINT valid_investor_intent 
CHECK (investor_intent IS NULL OR investor_intent IN ('investor', 'off_plan', 'rental', 'golden_visa'));

-- Add index for filtering by intent
CREATE INDEX IF NOT EXISTS idx_email_subscribers_intent 
ON public.email_subscribers(investor_intent) WHERE investor_intent IS NOT NULL;

-- Insert Off-Plan email sequences (10 emails)
INSERT INTO public.email_drip_sequences (sequence_name, email_key, subject, day_offset, target_tier, email_type, is_active) VALUES
('Off-Plan Welcome', 'off_plan_day_0', 'Your Dubai Off-Plan Investment Guide', 0, 'off_plan', 'onboarding', true),
('Off-Plan Day 1', 'off_plan_day_1', 'Why Smart Investors Choose Off-Plan in Dubai', 1, 'off_plan', 'education', true),
('Off-Plan Day 3', 'off_plan_day_3', 'Understanding Payment Plans: Your Complete Guide', 3, 'off_plan', 'education', true),
('Off-Plan Day 5', 'off_plan_day_5', 'Top 5 Off-Plan Projects Right Now', 5, 'off_plan', 'education', true),
('Off-Plan Day 7', 'off_plan_day_7', 'Developer Track Records: Who to Trust', 7, 'off_plan', 'education', true),
('Off-Plan Day 10', 'off_plan_day_10', 'Off-Plan vs Ready: ROI Comparison', 10, 'off_plan', 'education', true),
('Off-Plan Day 14', 'off_plan_day_14', 'Exclusive: New Launches This Month', 14, 'off_plan', 'promotion', true),
('Off-Plan Day 21', 'off_plan_day_21', 'Off-Plan Success Stories from Our Members', 21, 'off_plan', 'social_proof', true),
('Off-Plan Day 30', 'off_plan_day_30', 'Your Personalized Off-Plan Shortlist Awaits', 30, 'off_plan', 'conversion', true),
('Off-Plan Day 45', 'off_plan_day_45', 'Final: Book Your Free Consultation', 45, 'off_plan', 'conversion', true),

-- Insert STR/Rental email sequences (7 emails)
('Rental Welcome', 'rental_day_0', 'Your Dubai Rental Income Strategy', 0, 'rental', 'onboarding', true),
('Rental Day 1', 'rental_day_1', 'Airbnb vs Long-Term: Which Makes More?', 1, 'rental', 'education', true),
('Rental Day 3', 'rental_day_3', 'Top Areas for Rental Yields in 2025', 3, 'rental', 'education', true),
('Rental Day 7', 'rental_day_7', 'Setting Up Your STR: Complete Checklist', 7, 'rental', 'education', true),
('Rental Day 14', 'rental_day_14', 'Real Numbers: Our Members'' Rental Returns', 14, 'rental', 'social_proof', true),
('Rental Day 21', 'rental_day_21', 'Properties with 8%+ Rental Yield', 21, 'rental', 'promotion', true),
('Rental Day 30', 'rental_day_30', 'Ready to Start? Let''s Find Your Property', 30, 'rental', 'conversion', true),

-- Insert Golden Visa email sequences (5 emails)
('Golden Visa Welcome', 'golden_visa_day_0', 'Your Path to UAE Golden Visa', 0, 'golden_visa', 'onboarding', true),
('Golden Visa Day 1', 'golden_visa_day_1', 'Golden Visa Requirements: 2025 Complete Guide', 1, 'golden_visa', 'education', true),
('Golden Visa Day 3', 'golden_visa_day_3', 'Properties That Qualify for Golden Visa', 3, 'golden_visa', 'education', true),
('Golden Visa Day 7', 'golden_visa_day_7', 'Success Stories: Golden Visa Holders', 7, 'golden_visa', 'social_proof', true),
('Golden Visa Day 14', 'golden_visa_day_14', 'Start Your Golden Visa Application', 14, 'golden_visa', 'conversion', true);