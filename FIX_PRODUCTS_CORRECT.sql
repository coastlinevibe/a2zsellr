-- Fix products to assign them to the correct profile
-- Based on your database

-- Product "fds" should belong to profile: 3aa2b6e7-a715-4256-a293-3cf9943b910e
UPDATE profile_products
SET profile_id = '3aa2b6e7-a715-4256-a293-3cf9943b910e'
WHERE id = '6dbcaaa8-dc5f-4c3e-a0b8-865c6a2c54c4';

-- Product "5555" should belong to profile: 3aa2b6e7-a715-4256-a293-3cf9943b910e
UPDATE profile_products
SET profile_id = '3aa2b6e7-a715-4256-a293-3cf9943b910e'
WHERE id = '8b9612d2-1986-4abe-9210-c1b48a8ff6c5';

-- Product "teny weeny" should belong to profile: 418da5e9-6300-40bd-9fbd-ca8c07968857
UPDATE profile_products
SET profile_id = '418da5e9-6300-40bd-9fbd-ca8c07968857'
WHERE id = 'bf8fe2870-2f25-4565-93b6-04c5fe6f0040';

-- Verify all products now have correct profile_id
SELECT 
    pp.id,
    pp.name,
    pp.profile_id,
    p.display_name as owner
FROM profile_products pp
JOIN profiles p ON pp.profile_id = p.id
ORDER BY p.display_name, pp.name;
