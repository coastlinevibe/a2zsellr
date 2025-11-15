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

// Add styles for the checkout button
const checkoutStyles = `
  .checkout-container {
    background-color: #ffffff;
    display: flex;
    width: 100%;
    height: 120px;
    position: relative;
    border-radius: 6px;
    transition: 0.3s ease-in-out;
    border: 1px solid #e5e7eb;
  }

  .checkout-container:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .checkout-container:hover .checkout-left-side {
    width: 100%;
  }

  .checkout-left-side {
    background-color: #5de2a3;
    width: 130px;
    height: 120px;
    border-radius: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    flex-shrink: 0;
    overflow: hidden;
  }

  .checkout-right-side {
    display: flex;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    justify-content: space-between;
    white-space: nowrap;
    transition: 0.3s;
    flex: 1;
  }

  .checkout-right-side:hover {
    background-color: #f9f7f9;
  }

  .checkout-new {
    font-size: 20px;
    font-family: "Lexend Deca", sans-serif;
    margin-left: 20px;
    font-weight: 600;
    color: #111827;
  }

  .checkout-card {
    width: 70px;
    height: 46px;
    background-color: #c7ffbc;
    border-radius: 6px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
  }

  .checkout-card-line {
    width: 65px;
    height: 13px;
    background-color: #80ea69;
    border-radius: 2px;
    margin-top: 7px;
  }

  .checkout-buttons {
    width: 8px;
    height: 8px;
    background-color: #379e1f;
    box-shadow: 0 -10px 0 0 #26850e, 0 10px 0 0 #56be3e;
    border-radius: 50%;
    margin-top: 5px;
    transform: rotate(90deg);
    margin: 10px 0 0 -30px;
  }

  .checkout-container:hover .checkout-card {
    animation: checkout-slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  .checkout-container:hover .checkout-post {
    animation: checkout-slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  @keyframes checkout-slide-top {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-70px) rotate(90deg);
    }
    60% {
      transform: translateY(-70px) rotate(90deg);
    }
    100% {
      transform: translateY(-8px) rotate(90deg);
    }
  }

  .checkout-post {
    width: 63px;
    height: 75px;
    background-color: #dddde0;
    position: absolute;
    z-index: 11;
    bottom: 10px;
    top: 120px;
    border-radius: 6px;
    overflow: hidden;
  }

  .checkout-post-line {
    width: 47px;
    height: 9px;
    background-color: #545354;
    position: absolute;
    border-radius: 0px 0px 3px 3px;
    right: 8px;
    top: 8px;
  }

  .checkout-post-line:before {
    content: "";
    position: absolute;
    width: 47px;
    height: 9px;
    background-color: #757375;
    top: -8px;
  }

  .checkout-screen {
    width: 47px;
    height: 23px;
    background-color: #ffffff;
    position: absolute;
    top: 22px;
    right: 8px;
    border-radius: 3px;
  }

  .checkout-numbers {
    width: 12px;
    height: 12px;
    background-color: #838183;
    box-shadow: 0 -18px 0 0 #838183, 0 18px 0 0 #838183;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 52px;
  }

  .checkout-numbers-line2 {
    width: 12px;
    height: 12px;
    background-color: #aaa9ab;
    box-shadow: 0 -18px 0 0 #aaa9ab, 0 18px 0 0 #aaa9ab;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 68px;
  }

  @keyframes checkout-slide-post {
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-70px);
    }
  }

  .checkout-dollar {
    position: absolute;
    font-size: 16px;
    font-family: "Lexend Deca", sans-serif;
    width: 100%;
    left: 0;
    top: 0;
    color: #4b953b;
    text-align: center;
  }

  .checkout-container:hover .checkout-dollar {
    animation: checkout-fade-in-fwd 0.3s 1s backwards;
  }

  @keyframes checkout-fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media only screen and (max-width: 480px) {
    .checkout-container {
      transform: scale(0.85);
      height: auto;
    }

    .checkout-container:hover {
      transform: scale(0.87);
    }

    .checkout-new {
      font-size: 16px;
    }
  }
`

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, removeItem, updateQuantity, getItemCount, getSubtotal, getItemsByBusiness } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const itemsByBusiness = getItemsByBusiness()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  if (!isOpen) return null

  return (
    <>
      {/* Inject checkout button styles */}
      <style>{checkoutStyles}</style>

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

            {/* Checkout Button - Animated Card Style */}
            <Link href="/checkout" onClick={onClose} className="block">
              <div className="checkout-container">
                <div className="checkout-left-side">
                  <div className="checkout-card">
                    <div className="checkout-card-line"></div>
                    <div className="checkout-buttons"></div>
                  </div>
                  <div className="checkout-post">
                    <div className="checkout-post-line"></div>
                    <div className="checkout-screen">
                      <div className="checkout-dollar">$</div>
                    </div>
                    <div className="checkout-numbers"></div>
                    <div className="checkout-numbers-line2"></div>
                  </div>
                </div>
                <div className="checkout-right-side">
                  <div className="checkout-new">
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
