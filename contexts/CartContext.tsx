'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number // in cents
  quantity: number
  image?: string
  businessId: string
  businessName: string
  variant?: {
    size?: string
    color?: string
    options?: Record<string, string>
  }
  maxQuantity?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  clearBusinessCart: (businessId: string) => void
  getItemCount: () => number
  getSubtotal: () => number
  getBusinessSubtotal: (businessId: string) => number
  getItemsByBusiness: () => Record<string, CartItem[]>
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | undefined
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'a2z_shopping_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [items, isLoaded])

  const addItem = (newItem: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    setItems(currentItems => {
      // Check if item already exists (same product and variant)
      const existingItemIndex = currentItems.findIndex(
        item => 
          item.productId === newItem.productId &&
          JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
      )

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems]
        const currentQuantity = updatedItems[existingItemIndex].quantity
        const newQuantity = currentQuantity + (newItem.quantity || 1)
        const maxQuantity = updatedItems[existingItemIndex].maxQuantity

        // Check max quantity
        if (maxQuantity && newQuantity > maxQuantity) {
          alert(`Cannot add more than ${maxQuantity} of this item`)
          return currentItems
        }

        updatedItems[existingItemIndex].quantity = newQuantity
        return updatedItems
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...newItem,
          id: `${newItem.productId}-${Date.now()}`,
          quantity: newItem.quantity || 1
        }
        return [...currentItems, cartItem]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId)
      return
    }

    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === itemId) {
          // Check max quantity
          if (item.maxQuantity && quantity > item.maxQuantity) {
            alert(`Cannot add more than ${item.maxQuantity} of this item`)
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const clearBusinessCart = (businessId: string) => {
    setItems(currentItems => currentItems.filter(item => item.businessId !== businessId))
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getBusinessSubtotal = (businessId: string) => {
    return items
      .filter(item => item.businessId === businessId)
      .reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getItemsByBusiness = () => {
    const grouped: Record<string, CartItem[]> = {}
    
    items.forEach(item => {
      if (!grouped[item.businessId]) {
        grouped[item.businessId] = []
      }
      grouped[item.businessId].push(item)
    })

    return grouped
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  const getCartItem = (productId: string) => {
    return items.find(item => item.productId === productId)
  }

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearBusinessCart,
    getItemCount,
    getSubtotal,
    getBusinessSubtotal,
    getItemsByBusiness,
    isInCart,
    getCartItem
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper function to format price
export function formatPrice(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}
