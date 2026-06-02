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
    <div className="flex gap-4 border-b border-border pb-4 py-4">
      {}
      <div className="h-24 w-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      {}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground line-clamp-2">{item.name}</h3>

        {}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-primary">
            {item.price.toLocaleString('vi-VN')}₫
          </span>
          {discount > 0 && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {item.originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="p-1 rounded border border-border hover:bg-muted transition-colors"
            aria-label="Giảm số lượng"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="p-1 rounded border border-border hover:bg-muted transition-colors"
            aria-label="Tăng số lượng"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id)}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 size={18} />
        </button>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Tổng tiền</p>
          <p className="font-bold text-primary">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>
    </div>
  );
}