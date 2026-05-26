'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import CartItem from './CartItem';

interface CartDrawerProps {
  setIsOpen: (open: boolean) => void;
}

export default function CartDrawer({ setIsOpen }: CartDrawerProps) {
  const { items, subtotal, total, discountAmount } = useCart();

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-50 transition-transform duration-300 overflow-y-auto translate-x-0"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingCart size={20} />
            Giỏ hàng
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Đóng giỏ hàng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <ShoppingCart size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Giỏ hàng của bạn trống</p>
            <p className="text-sm text-muted-foreground mb-4">Hãy thêm sản phẩm để bắt đầu mua sắm</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary font-medium hover:underline text-sm"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Summary */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="font-medium text-green-600">
                      -{discountAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                  <span>Tổng:</span>
                  <span className="text-primary">{total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Xem giỏ hàng
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-border text-foreground font-medium py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}