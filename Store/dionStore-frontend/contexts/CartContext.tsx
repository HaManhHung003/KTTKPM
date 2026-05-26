'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; discount: number; message: string };
  removeCoupon: () => void;
  couponCode: string | null;
  discountAmount: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const COUPON_CODES: { [key: string]: number } = {
  DION50: 50000,
  TECH20: 20,
  SUMMER30: 30,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dion-cart');
    const savedCoupon = localStorage.getItem('dion-coupon');
    const savedDiscount = localStorage.getItem('dion-discount');

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    if (savedCoupon) setCouponCode(savedCoupon);
    if (savedDiscount) setDiscountAmount(parseFloat(savedDiscount));

    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('dion-cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // Save coupon to localStorage
  useEffect(() => {
    if (isHydrated) {
      if (couponCode) {
        localStorage.setItem('dion-coupon', couponCode);
      } else {
        localStorage.removeItem('dion-coupon');
      }
    }
  }, [couponCode, isHydrated]);

  // Save discount to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('dion-discount', discountAmount.toString());
    }
  }, [discountAmount, isHydrated]);

  const addItem = (product: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevItems, { ...product, quantity: qty }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const applyCoupon = (code: string) => {
    const upperCode = code.toUpperCase();

    if (!COUPON_CODES[upperCode]) {
      return { success: false, discount: 0, message: 'Mã giảm giá không hợp lệ' };
    }

    const discountValue = COUPON_CODES[upperCode];
    let calculatedDiscount = 0;

    // If discount is a percentage
    if (discountValue < 100) {
      calculatedDiscount = (subtotal * discountValue) / 100;
    } else {
      // If discount is a fixed amount
      calculatedDiscount = discountValue;
    }

    setCouponCode(upperCode);
    setDiscountAmount(calculatedDiscount);

    return {
      success: true,
      discount: calculatedDiscount,
      message: `Áp dụng mã ${upperCode} thành công!`,
    };
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        couponCode,
        discountAmount,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}