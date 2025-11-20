// API routes for the tagging system
// Add these to your Next.js API routes or backend

// GET /api/product-tags - Fetch all available tags
export async function getProductTags() {
  const { data, error } = await supabase
    .from('product_tags')
    .select('*')
    .order('is_system_tag', { ascending: false })
    .order('name');

  if (error) throw error;
  return data;
}

// POST /api/product-tags - Create a new tag
export async function createProductTag(tagData: {
  name: string;
  icon?: string;
  color: string;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('product_tags')
    .insert([tagData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// POST /api/products/{id}/tags - Assign tags to a product
export async function assignProductTags(productId: string, tagIds: string[]) {
  // First, remove existing assignments
  await supabase
    .from('product_tag_assignments')
    .delete()
    .eq('product_id', productId);

  // Then add new assignments
  const assignments = tagIds.map(tagId => ({
    product_id: productId,
    tag_id: tagId
  }));

  const { data, error } = await supabase
    .from('product_tag_assignments')
    .insert(assignments)
    .select();

  if (error) throw error;
  return data;
}

// GET /api/products-with-tags - Get products with their tags
export async function getProductsWithTags(profileId?: string) {
  let query = supabase.from('products_with_tags').select('*');
  
  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Example Next.js API route implementation:
// pages/api/product-tags.ts or app/api/product-tags/route.ts

/*
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const tags = await getProductTags();
      res.status(200).json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  } else if (req.method === 'POST') {
    try {
      const tag = await createProductTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
*/