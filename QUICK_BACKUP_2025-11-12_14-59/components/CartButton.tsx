'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import ShoppingCartDrawer from '@/components/ShoppingCart'

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      <ShoppingCartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}
