-- Default Categories and Locations Data
-- Run this after creating the categories and locations tables

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, is_active) VALUES
('Restaurants', 'restaurants', 'Food and dining establishments', 'utensils', true),
('Retail', 'retail', 'Shopping and retail stores', 'shopping-bag', true),
('Services', 'services', 'Professional and personal services', 'briefcase', true),
('Healthcare', 'healthcare', 'Medical and health services', 'heart', true),
('Technology', 'technology', 'IT and technology companies', 'laptop', true),
('Automotive', 'automotive', 'Car dealerships and auto services', 'car', true),
('Beauty & Wellness', 'beauty-wellness', 'Salons, spas, and wellness centers', 'scissors', true),
('Education', 'education', 'Schools, training, and educational services', 'book-open', true),
('Entertainment', 'entertainment', 'Entertainment and leisure activities', 'music', true),
('Real Estate', 'real-estate', 'Property and real estate services', 'home', true),
('Finance', 'finance', 'Banks, insurance, and financial services', 'dollar-sign', true),
('Construction', 'construction', 'Building and construction services', 'hammer', true),
('Agriculture', 'agriculture', 'Farming and agricultural businesses', 'leaf', true),
('Tourism', 'tourism', 'Travel, accommodation, and tourism', 'map-pin', true),
('Sports & Fitness', 'sports-fitness', 'Gyms, sports clubs, and fitness centers', 'dumbbell', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default South African locations
INSERT INTO locations (city, slug, province, country, is_active) VALUES
-- Gauteng
('Johannesburg', 'johannesburg', 'Gauteng', 'South Africa', true),
('Pretoria', 'pretoria', 'Gauteng', 'South Africa', true),
('Sandton', 'sandton', 'Gauteng', 'South Africa', true),
('Randburg', 'randburg', 'Gauteng', 'South Africa', true),
('Roodepoort', 'roodepoort', 'Gauteng', 'South Africa', true),
('Soweto', 'soweto', 'Gauteng', 'South Africa', true),
('Midrand', 'midrand', 'Gauteng', 'South Africa', true),

-- Western Cape
('Cape Town', 'cape-town', 'Western Cape', 'South Africa', true),
('Stellenbosch', 'stellenbosch', 'Western Cape', 'South Africa', true),
('Paarl', 'paarl', 'Western Cape', 'South Africa', true),
('George', 'george', 'Western Cape', 'South Africa', true),
('Hermanus', 'hermanus', 'Western Cape', 'South Africa', true),
('Knysna', 'knysna', 'Western Cape', 'South Africa', true),

-- KwaZulu-Natal
('Durban', 'durban', 'KwaZulu-Natal', 'South Africa', true),
('Pietermaritzburg', 'pietermaritzburg', 'KwaZulu-Natal', 'South Africa', true),
('Newcastle', 'newcastle', 'KwaZulu-Natal', 'South Africa', true),
('Richards Bay', 'richards-bay', 'KwaZulu-Natal', 'South Africa', true),

-- Eastern Cape
('Port Elizabeth', 'port-elizabeth', 'Eastern Cape', 'South Africa', true),
('East London', 'east-london', 'Eastern Cape', 'South Africa', true),
('Grahamstown', 'grahamstown', 'Eastern Cape', 'South Africa', true),

-- Free State
('Bloemfontein', 'bloemfontein', 'Free State', 'South Africa', true),
('Welkom', 'welkom', 'Free State', 'South Africa', true),

-- Mpumalanga
('Nelspruit', 'nelspruit', 'Mpumalanga', 'South Africa', true),
('Witbank', 'witbank', 'Mpumalanga', 'South Africa', true),

-- Limpopo
('Polokwane', 'polokwane', 'Limpopo', 'South Africa', true),

-- North West
('Rustenburg', 'rustenburg', 'North West', 'South Africa', true),
('Potchefstroom', 'potchefstroom', 'North West', 'South Africa', true),

-- Northern Cape
('Kimberley', 'kimberley', 'Northern Cape', 'South Africa', true)

ON CONFLICT (slug) DO NOTHING;

-- Verify data was inserted
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;
SELECT 'Locations inserted:' as info, COUNT(*) as count FROM locations;
