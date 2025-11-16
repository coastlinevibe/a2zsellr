import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes(process.env.SUPABASE_SERVICE_ROLE_KEY || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Setup RLS policies for orders table
    const { error: ordersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Enable RLS on orders table
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
        DROP POLICY IF EXISTS "Businesses can view their orders" ON public.orders;

        -- Create new policies
        -- Allow anyone to insert orders (for checkout)
        CREATE POLICY "Anyone can insert orders" ON public.orders
          FOR INSERT WITH CHECK (true);

        -- Allow customers to view their own orders
        CREATE POLICY "Users can view own orders" ON public.orders
          FOR SELECT USING (auth.uid() = customer_id OR customer_id IS NULL);

        -- Allow businesses to view orders for their products
        CREATE POLICY "Businesses can view their orders" ON public.orders
          FOR SELECT USING (auth.uid() = business_id);

        -- Enable RLS on order_items table
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
        DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;

        -- Create new policies
        CREATE POLICY "Anyone can insert order items" ON public.order_items
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Users can view order items" ON public.order_items
          FOR SELECT USING (true);
      `
    })

    if (ordersError) {
      console.error('RLS setup error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to setup RLS policies', details: ordersError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies configured successfully'
    })

  } catch (error) {
    console.error('Setup RLS error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup RLS' },
      { status: 500 }
    )
  }
}
