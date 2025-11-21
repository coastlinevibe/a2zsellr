import { NextRequest, NextResponse } from 'next/server'
import { getDefaultProductsForCategory } from '@/lib/defaultProducts'

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json()
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const products = getDefaultProductsForCategory(category)
    
    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        details: product.details
      }))
    })

  } catch (error) {
    console.error('Get default products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}