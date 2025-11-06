-- Fix orphaned products that belong to non-existent profiles
-- This happens when products are created with incorrect profile_id

-- Step 1: Check which products are orphaned
SELECT 
    pp.id,
    pp.name,
    pp.profile_id,
    p.display_name as profile_name
FROM profile_products pp
LEFT JOIN profiles p ON pp.profile_id = p.id
WHERE p.id IS NULL;

-- Step 2: Find your current profile ID
-- Replace 'YOUR_EMAIL' with your actual email
SELECT id, display_name, email 
FROM profiles 
WHERE email = 'YOUR_EMAIL';

-- Step 3: Reassign orphaned products to your profile
-- Replace 'YOUR_PROFILE_ID' with the ID from Step 2
UPDATE profile_products
SET profile_id = 'YOUR_PROFILE_ID'
WHERE profile_id NOT IN (SELECT id FROM profiles);

-- Step 4: Verify the fix
SELECT 
    pp.id,
    pp.name,
    pp.profile_id,
    p.display_name as profile_name
FROM profile_products pp
LEFT JOIN profiles p ON pp.profile_id = p.id;
