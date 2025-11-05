/**
 * Order Service
 * Functions for creating and managing orders
 */

import { supabase } from './supabaseClient'
import { CartItem } from '@/contexts/CartContext'

export interface CreateOrderData {
  // Customer details
  customerName: string
  customerEmail: string
  customerPhone?: string
  
  // Shipping details
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  shippingPostalCode: string
  shippingNotes?: string
  
  // Payment
  paymentMethod: string
  
  // Items grouped by business
  businessOrders: {
    businessId: string
    items: CartItem[]
  }[]
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  business_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal_code: string
  shipping_notes?: string
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  payment_method: string
  payment_status: string
  payment_id?: string
  payment_date?: string
  status: string
  created_at: string
  updated_at: string
  notes?: string
  tracking_number?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_description?: string
  product_image_url?: string
  variant_size?: string
  variant_color?: string
  variant_options?: any
  unit_price_cents: number
  quantity: number
  subtotal_cents: number
  created_at: string
}

/**
 * Create orders from cart items
 * Creates separate orders for each business
 */
export async function createOrders(data: CreateOrderData, userId?: string): Promise<Order[]> {
  const createdOrders: Order[] = []

  try {
    // Create an order for each business
    for (const businessOrder of data.businessOrders) {
      const { businessId, items } = businessOrder

      // Calculate totals
      const subtotalCents = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shippingCents = 0 // Free shipping
      const taxCents = Math.round(subtotalCents * 0.15) // 15% VAT
      const totalCents = subtotalCents + shippingCents + taxCents

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: userId || null,
          business_id: businessId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone || null,
          shipping_address: data.shippingAddress,
          shipping_city: data.shippingCity,
          shipping_province: data.shippingProvince,
          shipping_postal_code: data.shippingPostalCode,
          shipping_notes: data.shippingNotes || null,
          subtotal_cents: subtotalCents,
          shipping_cents: shippingCents,
          tax_cents: taxCents,
          total_cents: totalCents,
          payment_method: data.paymentMethod,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_image_url: item.image || null,
        variant_size: item.variant?.size || null,
        variant_color: item.variant?.color || null,
        variant_options: item.variant?.options || null,
        unit_price_cents: item.price,
        quantity: item.quantity,
        subtotal_cents: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      createdOrders.push(order)
    }

    return createdOrders
  } catch (error) {
    console.error('Error creating orders:', error)
    throw error
  }
}

/**
 * Get orders for a customer
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    throw error
  }
}

/**
 * Get orders for a business
 */
export async function getBusinessOrders(businessId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching business orders:', error)
    throw error
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderWithItems(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    return { order, items: items || [] }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  notes?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error

    // Add to status history if table exists
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes: notes || `Status changed to ${status}`
        })
    } catch (historyError) {
      // Ignore if history table doesn't exist
      console.warn('Could not add status history:', historyError)
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentId?: string
): Promise<void> {
  try {
    const updateData: any = {
      payment_status: paymentStatus
    }

    if (paymentId) {
      updateData.payment_id = paymentId
    }

    if (paymentStatus === 'paid') {
      updateData.payment_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
  try {
    await updateOrderStatus(orderId, 'cancelled', reason || 'Order cancelled by customer')
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

/**
 * Format price from cents to Rands
 */
export function formatPrice(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

/**
 * Get order status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'processing':
      return 'bg-purple-100 text-purple-800'
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
