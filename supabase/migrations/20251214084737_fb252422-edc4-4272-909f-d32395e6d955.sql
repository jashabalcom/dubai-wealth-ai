-- Update neighborhoods with avg_price_sqft and avg_rental_yield from DUBAI_AREA_PRESETS data
-- Price/SqFt = propertyPrice / sizeSqft, Yield = (annualRent / propertyPrice) * 100

-- Premium Areas
UPDATE public.neighborhoods SET avg_price_sqft = 2500, avg_rental_yield = 5.1 WHERE LOWER(name) LIKE '%palm jumeirah%';
UPDATE public.neighborhoods SET avg_price_sqft = 2909, avg_rental_yield = 5.6 WHERE LOWER(name) LIKE '%downtown%';
UPDATE public.neighborhoods SET avg_price_sqft = 3500, avg_rental_yield = 5.0 WHERE LOWER(name) = 'difc';
UPDATE public.neighborhoods SET avg_price_sqft = 2083, avg_rental_yield = 5.6 WHERE LOWER(name) LIKE '%dubai marina%' OR LOWER(name) = 'marina';
UPDATE public.neighborhoods SET avg_price_sqft = 2143, avg_rental_yield = 5.3 WHERE LOWER(name) LIKE '%jbr%' OR LOWER(name) LIKE '%jumeirah beach residence%';
UPDATE public.neighborhoods SET avg_price_sqft = 2800, avg_rental_yield = 5.0 WHERE LOWER(name) LIKE '%bluewaters%';
UPDATE public.neighborhoods SET avg_price_sqft = 2333, avg_rental_yield = 5.4 WHERE LOWER(name) LIKE '%city walk%';
UPDATE public.neighborhoods SET avg_price_sqft = 1875, avg_rental_yield = 3.7 WHERE LOWER(name) LIKE '%emirates hills%';

-- Mid-Range Areas
UPDATE public.neighborhoods SET avg_price_sqft = 1800, avg_rental_yield = 5.6 WHERE LOWER(name) LIKE '%business bay%';
UPDATE public.neighborhoods SET avg_price_sqft = 1571, avg_rental_yield = 5.5 WHERE LOWER(name) LIKE '%dubai hills%';
UPDATE public.neighborhoods SET avg_price_sqft = 2000, avg_rental_yield = 5.4 WHERE LOWER(name) LIKE '%creek harbour%' OR LOWER(name) LIKE '%dubai creek%';
UPDATE public.neighborhoods SET avg_price_sqft = 1538, avg_rental_yield = 5.0 WHERE LOWER(name) LIKE '%mbr city%' OR LOWER(name) LIKE '%mohammed bin rashid%';
UPDATE public.neighborhoods SET avg_price_sqft = 1680, avg_rental_yield = 5.5 WHERE LOWER(name) LIKE '%sobha hartland%';
UPDATE public.neighborhoods SET avg_price_sqft = 1091, avg_rental_yield = 7.1 WHERE LOWER(name) = 'jlt' OR LOWER(name) LIKE '%jumeirah lake%';
UPDATE public.neighborhoods SET avg_price_sqft = 1333, avg_rental_yield = 5.9 WHERE LOWER(name) LIKE '%meydan%';
UPDATE public.neighborhoods SET avg_price_sqft = 1273, avg_rental_yield = 6.4 WHERE LOWER(name) LIKE '%greens%';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 4.8 WHERE LOWER(name) LIKE '%arabian ranches%';

-- Affordable / High-Yield Areas
UPDATE public.neighborhoods SET avg_price_sqft = 1056, avg_rental_yield = 6.8 WHERE LOWER(name) = 'jvc' OR LOWER(name) LIKE '%jumeirah village circle%';
UPDATE public.neighborhoods SET avg_price_sqft = 833, avg_rental_yield = 7.3 WHERE LOWER(name) LIKE '%sports city%';
UPDATE public.neighborhoods SET avg_price_sqft = 950, avg_rental_yield = 6.5 WHERE LOWER(name) LIKE '%motor city%';
UPDATE public.neighborhoods SET avg_price_sqft = 895, avg_rental_yield = 7.1 WHERE LOWER(name) LIKE '%silicon oasis%';
UPDATE public.neighborhoods SET avg_price_sqft = 875, avg_rental_yield = 7.1 WHERE LOWER(name) LIKE '%town square%';
UPDATE public.neighborhoods SET avg_price_sqft = 1000, avg_rental_yield = 6.4 WHERE LOWER(name) LIKE '%damac hills%';
UPDATE public.neighborhoods SET avg_price_sqft = 947, avg_rental_yield = 6.9 WHERE LOWER(name) LIKE '%al furjan%' OR LOWER(name) = 'furjan';
UPDATE public.neighborhoods SET avg_price_sqft = 867, avg_rental_yield = 7.4 WHERE LOWER(name) LIKE '%dubai south%';
UPDATE public.neighborhoods SET avg_price_sqft = 786, avg_rental_yield = 7.6 WHERE LOWER(name) LIKE '%discovery gardens%';
UPDATE public.neighborhoods SET avg_price_sqft = 692, avg_rental_yield = 8.4 WHERE LOWER(name) LIKE '%international city%';

-- Additional luxury areas (market research estimates)
UPDATE public.neighborhoods SET avg_price_sqft = 2400, avg_rental_yield = 4.2 WHERE LOWER(name) LIKE '%al barari%';
UPDATE public.neighborhoods SET avg_price_sqft = 1800, avg_rental_yield = 4.5 WHERE LOWER(name) LIKE '%jumeirah golf%';
UPDATE public.neighborhoods SET avg_price_sqft = 1600, avg_rental_yield = 5.2 WHERE LOWER(name) LIKE '%jumeirah islands%';
UPDATE public.neighborhoods SET avg_price_sqft = 1750, avg_rental_yield = 4.8 WHERE LOWER(name) LIKE '%jumeirah park%';
UPDATE public.neighborhoods SET avg_price_sqft = 2200, avg_rental_yield = 5.0 WHERE LOWER(name) LIKE '%la mer%';
UPDATE public.neighborhoods SET avg_price_sqft = 1200, avg_rental_yield = 5.8 WHERE LOWER(name) LIKE '%tecom%';
UPDATE public.neighborhoods SET avg_price_sqft = 1150, avg_rental_yield = 6.0 WHERE LOWER(name) LIKE '%barsha%';
UPDATE public.neighborhoods SET avg_price_sqft = 1050, avg_rental_yield = 6.2 WHERE LOWER(name) LIKE '%dubai investment park%' OR LOWER(name) = 'dip';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.5 WHERE LOWER(name) LIKE '%production city%' OR LOWER(name) LIKE '%impz%';
UPDATE public.neighborhoods SET avg_price_sqft = 950, avg_rental_yield = 6.8 WHERE LOWER(name) LIKE '%remraam%';
UPDATE public.neighborhoods SET avg_price_sqft = 980, avg_rental_yield = 6.5 WHERE LOWER(name) LIKE '%jvt%' OR LOWER(name) LIKE '%jumeirah village triangle%';
UPDATE public.neighborhoods SET avg_price_sqft = 1300, avg_rental_yield = 5.5 WHERE LOWER(name) LIKE '%mudon%';
UPDATE public.neighborhoods SET avg_price_sqft = 1450, avg_rental_yield = 5.0 WHERE LOWER(name) LIKE '%tilal al ghaf%';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.0 WHERE LOWER(name) LIKE '%arjan%';
UPDATE public.neighborhoods SET avg_price_sqft = 1000, avg_rental_yield = 6.3 WHERE LOWER(name) LIKE '%liwan%';
UPDATE public.neighborhoods SET avg_price_sqft = 1350, avg_rental_yield = 5.2 WHERE LOWER(name) LIKE '%mirdif%';
UPDATE public.neighborhoods SET avg_price_sqft = 1500, avg_rental_yield = 5.0 WHERE LOWER(name) LIKE '%al wasl%';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 5.3 WHERE LOWER(name) LIKE '%umm suqeim%';
UPDATE public.neighborhoods SET avg_price_sqft = 1250, avg_rental_yield = 5.6 WHERE LOWER(name) LIKE '%al quoz%';
UPDATE public.neighborhoods SET avg_price_sqft = 800, avg_rental_yield = 7.0 WHERE LOWER(name) LIKE '%warsan%';
UPDATE public.neighborhoods SET avg_price_sqft = 1050, avg_rental_yield = 6.4 WHERE LOWER(name) LIKE '%al nahda%';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.2 WHERE LOWER(name) LIKE '%al qusais%';
UPDATE public.neighborhoods SET avg_price_sqft = 950, avg_rental_yield = 6.6 WHERE LOWER(name) LIKE '%deira%';
UPDATE public.neighborhoods SET avg_price_sqft = 1000, avg_rental_yield = 6.3 WHERE LOWER(name) LIKE '%bur dubai%';
UPDATE public.neighborhoods SET avg_price_sqft = 1150, avg_rental_yield = 6.0 WHERE LOWER(name) LIKE '%oud metha%';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 5.4 WHERE LOWER(name) LIKE '%dubai festival city%';
UPDATE public.neighborhoods SET avg_price_sqft = 2100, avg_rental_yield = 5.2 WHERE LOWER(name) LIKE '%madinat jumeirah%';