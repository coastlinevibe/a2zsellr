-- Allow public access to profile listings for campaign pages
-- Listings should be publicly viewable for marketing purposes

-- Drop the restrictive policy that only allows users to view their own listings
DROP POLICY IF EXISTS "Users can view their own listings" ON profile_listings;

-- Create a new policy that allows anyone to view active listings
-- (assuming there's a status field that indicates if a listing is active/public)
CREATE POLICY "Anyone can view active listings" ON profile_listings
  FOR SELECT USING (status = 'active' OR status IS NULL);

-- Alternative: If there's no status field, allow public access to all listings
-- Uncomment the line below if listings should be completely public
-- CREATE POLICY "Anyone can view listings" ON profile_listings FOR SELECT USING (true);
