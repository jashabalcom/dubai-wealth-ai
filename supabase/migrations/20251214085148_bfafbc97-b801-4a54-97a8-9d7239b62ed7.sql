-- Populate remaining 53 neighborhoods with avg_price_sqft and avg_rental_yield data
-- Based on Q4 2024 market research estimates

-- Premium/Luxury Areas
UPDATE public.neighborhoods SET avg_price_sqft = 3200, avg_rental_yield = 4.8 WHERE slug = 'dubai-harbour';
UPDATE public.neighborhoods SET avg_price_sqft = 2800, avg_rental_yield = 4.5 WHERE slug = 'dubai-islands';
UPDATE public.neighborhoods SET avg_price_sqft = 2600, avg_rental_yield = 4.6 WHERE slug = 'pearl-jumeirah';
UPDATE public.neighborhoods SET avg_price_sqft = 3500, avg_rental_yield = 3.8 WHERE slug = 'the-world-islands';
UPDATE public.neighborhoods SET avg_price_sqft = 2400, avg_rental_yield = 4.5 WHERE slug = 'jumeirah';
UPDATE public.neighborhoods SET avg_price_sqft = 2200, avg_rental_yield = 4.8 WHERE slug = 'palm-jebel-ali';
UPDATE public.neighborhoods SET avg_price_sqft = 2800, avg_rental_yield = 4.2 WHERE slug = 'the-oasis';
UPDATE public.neighborhoods SET avg_price_sqft = 2200, avg_rental_yield = 5.2 WHERE slug = 'sheikh-zayed-road';
UPDATE public.neighborhoods SET avg_price_sqft = 2500, avg_rental_yield = 4.8 WHERE slug = 'zaabeel';
UPDATE public.neighborhoods SET avg_price_sqft = 2400, avg_rental_yield = 5.0 WHERE slug = 'mina-rashid';

-- Upper Mid-Range Areas
UPDATE public.neighborhoods SET avg_price_sqft = 2000, avg_rental_yield = 5.4 WHERE slug = 'dubai-design-district';
UPDATE public.neighborhoods SET avg_price_sqft = 1800, avg_rental_yield = 5.6 WHERE slug = 'al-sufouh';
UPDATE public.neighborhoods SET avg_price_sqft = 1900, avg_rental_yield = 5.5 WHERE slug = 'dubai-internet-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1850, avg_rental_yield = 5.5 WHERE slug = 'dubai-media-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1600, avg_rental_yield = 5.8 WHERE slug = 'culture-village';
UPDATE public.neighborhoods SET avg_price_sqft = 1500, avg_rental_yield = 6.0 WHERE slug = 'al-jaddaf';
UPDATE public.neighborhoods SET avg_price_sqft = 2000, avg_rental_yield = 5.2 WHERE slug = 'al-safa';
UPDATE public.neighborhoods SET avg_price_sqft = 1700, avg_rental_yield = 5.4 WHERE slug = 'jumeirah-heights';
UPDATE public.neighborhoods SET avg_price_sqft = 1800, avg_rental_yield = 5.2 WHERE slug = 'the-hills';
UPDATE public.neighborhoods SET avg_price_sqft = 1600, avg_rental_yield = 5.6 WHERE slug = 'the-views';

-- Emirates Living Communities
UPDATE public.neighborhoods SET avg_price_sqft = 1500, avg_rental_yield = 5.0 WHERE slug = 'the-lakes';
UPDATE public.neighborhoods SET avg_price_sqft = 1450, avg_rental_yield = 5.1 WHERE slug = 'the-meadows';
UPDATE public.neighborhoods SET avg_price_sqft = 1300, avg_rental_yield = 5.4 WHERE slug = 'the-springs';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 5.3 WHERE slug = 'green-community';

-- New/Emerging Developments
UPDATE public.neighborhoods SET avg_price_sqft = 1200, avg_rental_yield = 6.2 WHERE slug = 'damac-lagoons';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 6.0 WHERE slug = 'expo-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1300, avg_rental_yield = 5.8 WHERE slug = 'ghaf-woods';
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 5.5 WHERE slug = 'haven-by-aldar';
UPDATE public.neighborhoods SET avg_price_sqft = 1350, avg_rental_yield = 5.6 WHERE slug = 'the-acres';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.4 WHERE slug = 'the-valley';
UPDATE public.neighborhoods SET avg_price_sqft = 1050, avg_rental_yield = 6.6 WHERE slug = 'serena';
UPDATE public.neighborhoods SET avg_price_sqft = 1150, avg_rental_yield = 6.2 WHERE slug = 'reem';
UPDATE public.neighborhoods SET avg_price_sqft = 950, avg_rental_yield = 6.8 WHERE slug = 'majan';

-- Affordable/High-Yield Areas
UPDATE public.neighborhoods SET avg_price_sqft = 900, avg_rental_yield = 7.0 WHERE slug = 'dubai-studio-city';
UPDATE public.neighborhoods SET avg_price_sqft = 950, avg_rental_yield = 6.8 WHERE slug = 'dubai-science-park';
UPDATE public.neighborhoods SET avg_price_sqft = 850, avg_rental_yield = 7.2 WHERE slug = 'dubailand';
UPDATE public.neighborhoods SET avg_price_sqft = 800, avg_rental_yield = 7.5 WHERE slug = 'dubai-land-residence-complex';
UPDATE public.neighborhoods SET avg_price_sqft = 700, avg_rental_yield = 8.0 WHERE slug = 'dragon-city';
UPDATE public.neighborhoods SET avg_price_sqft = 750, avg_rental_yield = 7.6 WHERE slug = 'city-of-arabia';
UPDATE public.neighborhoods SET avg_price_sqft = 900, avg_rental_yield = 6.8 WHERE slug = 'falcon-city-of-wonders';
UPDATE public.neighborhoods SET avg_price_sqft = 850, avg_rental_yield = 7.0 WHERE slug = 'living-legends';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.2 WHERE slug = 'al-garhoud';
UPDATE public.neighborhoods SET avg_price_sqft = 1000, avg_rental_yield = 6.5 WHERE slug = 'al-satwa';
UPDATE public.neighborhoods SET avg_price_sqft = 750, avg_rental_yield = 7.8 WHERE slug = 'muhaisnah';
UPDATE public.neighborhoods SET avg_price_sqft = 850, avg_rental_yield = 7.2 WHERE slug = 'jebel-ali';
UPDATE public.neighborhoods SET avg_price_sqft = 650, avg_rental_yield = 8.2 WHERE slug = 'dubai-industrial-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1200, avg_rental_yield = 6.0 WHERE slug = 'dubai-maritime-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 6.2 WHERE slug = 'dubai-waterfront';

-- Established Residential Areas
UPDATE public.neighborhoods SET avg_price_sqft = 1400, avg_rental_yield = 5.5 WHERE slug = 'nad-al-sheba';
UPDATE public.neighborhoods SET avg_price_sqft = 1100, avg_rental_yield = 5.8 WHERE slug = 'the-villa';
UPDATE public.neighborhoods SET avg_price_sqft = 1300, avg_rental_yield = 5.6 WHERE slug = 'the-sustainable-city';
UPDATE public.neighborhoods SET avg_price_sqft = 1800, avg_rental_yield = 5.4 WHERE slug = 'world-trade-centre';
UPDATE public.neighborhoods SET avg_price_sqft = 1000, avg_rental_yield = 6.5 WHERE slug = 'wasl-gate';