'use client'

import { useState } from 'react'
import { X, ShoppingCart as ShoppingCartIcon, Trash2, Plus, Minus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, formatPrice } from '@/contexts/CartContext'
import Link from 'next/link'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, removeItem, updateQuantity, getItemCount, getSubtotal, getItemsByBusiness } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const itemsByBusiness = getItemsByBusiness()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-600 mb-6">
                Add products from businesses to get started
              </p>
              <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsByBusiness).map(([businessId, businessItems]) => (
                <div key={businessId} className="space-y-3">
                  {/* Business Name Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Package className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      {businessItems[0].businessName}
                    </h3>
                  </div>

                  {/* Business Items */}
                  {businessItems.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                      {/* Product Image */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm font-semibold text-emerald-600 mb-2">
                          {formatPrice(item.price)}
                        </p>

                        {/* Variant Info */}
                        {item.variant && (
                          <div className="text-xs text-gray-600 mb-2">
                            {item.variant.size && <span>Size: {item.variant.size}</span>}
                            {item.variant.color && <span className="ml-2">Color: {item.variant.color}</span>}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1.5 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900">Subtotal:</span>
              <span className="text-emerald-600">{formatPrice(subtotal)}</span>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" onClick={onClose}>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
