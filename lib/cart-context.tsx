'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { ApiRequestError } from '@/lib/api'
import { mapCartItems } from '@/lib/map-cart'
import {
  getGuestToken,
  publicCartAddItem,
  publicCartDeleteItem,
  publicCartPatchItem,
  publicFetchCart,
  setGuestToken,
} from '@/lib/public-api'
import type { CartLineItem } from '@/lib/types'

type AddToCartPayload = {
  product_id: number
  product_variant_id?: number
  quantity?: number
}

interface CartContextType {
  items: CartLineItem[]
  loading: boolean
  isHydrated: boolean
  refreshCart: () => Promise<void>
  addToCart: (payload: AddToCartPayload) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const refreshCart = useCallback(async () => {
    const token = getGuestToken()
    if (!token) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const cart = await publicFetchCart(token)
      setItems(mapCartItems(cart.items))
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 404) {
        setGuestToken(null)
        setItems([])
      } else {
        console.error('Failed to load cart', e)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCart().finally(() => setIsHydrated(true))
  }, [refreshCart])

  const addToCart = useCallback(async (payload: AddToCartPayload) => {
    const token = getGuestToken()
    const { cart, guestToken: nextToken } = await publicCartAddItem(token, {
      product_id: payload.product_id,
      product_variant_id: payload.product_variant_id,
      quantity: payload.quantity ?? 1,
    })
    if (nextToken) setGuestToken(nextToken)
    setItems(mapCartItems(cart.items))
  }, [])

  const removeFromCart = useCallback(async (cartItemId: number) => {
    const token = getGuestToken()
    if (!token) return
    const { cart } = await publicCartDeleteItem(token, cartItemId)
    setItems(mapCartItems(cart.items))
  }, [])

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    const token = getGuestToken()
    if (!token) return
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }
    const { cart } = await publicCartPatchItem(token, cartItemId, { quantity })
    setItems(mapCartItems(cart.items))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setGuestToken(null)
    setItems([])
  }, [])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const line = item.lineSubtotal ?? item.price * item.quantity
      return total + line
    }, 0)
  }, [items])

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isHydrated,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
