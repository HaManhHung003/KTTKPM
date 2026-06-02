'use client';

import React from 'react';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <div className="flex gap-4 border-b border-border/30 py-5 last:border-b-0 items-center">
      {/* Product Image */}
      <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 bg-muted/50 rounded-xl overflow-hidden border border-border/50 shadow-sm relative group">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors cursor-pointer">
          {item.name}
        </h3>

        {/* Pricing Details */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">
            {item.price.toLocaleString('vi-VN')}₫
          </span>
          {discount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {item.originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-[10px] sm:text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        {/* Modern Pill-Shaped Quantity Controls */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/40">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card hover:bg-primary hover:text-primary-foreground text-foreground shadow-sm flex items-center justify-center transition-all duration-200 active:scale-90"
              aria-label="Giảm số lượng"
            >
              <Minus size={14} className="stroke-[2.5]" />
            </button>
            <span className="w-8 text-center text-xs sm:text-sm font-bold text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card hover:bg-primary hover:text-primary-foreground text-foreground shadow-sm flex items-center justify-center transition-all duration-200 active:scale-90"
              aria-label="Tăng số lượng"
            >
              <Plus size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Action and Subtotal */}
      <div className="flex flex-col items-end justify-between h-20 sm:h-24 pl-2">
        <button
          onClick={() => removeItem(item.id)}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-90"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 size={16} sm={18} />
        </button>
        <div className="text-right">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Tạm tính</p>
          <p className="font-extrabold text-sm sm:text-base text-foreground mt-0.5">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>
    </div>
  );
}