'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import CartItem from './CartItem';

interface CartDrawerProps {
  setIsOpen: (open: boolean) => void;
}

export default function CartDrawer({ setIsOpen }: CartDrawerProps) {
  const { items, subtotal, total, discountAmount } = useCart();

  return (
    <>
      {/* Backdrop with Blur Effect */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Modern Slide-out Panel with Rounded Left Edges */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border/40 shadow-2xl z-50 transition-transform duration-300 overflow-y-auto translate-x-0 rounded-l-3xl flex flex-col justify-between"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/40 p-5 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Giỏ hàng 🐻
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-muted/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Đóng giỏ hàng"
          >
            <X size={20} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="text-5xl animate-bounce duration-1000 mb-4">🐻</div>
              <p className="font-bold text-foreground mb-1 text-sm sm:text-base">Giỏ hàng trống trơn</p>
              <p className="text-xs text-muted-foreground mb-5 max-w-[200px]">Hãy thêm sản phẩm yêu thích để tiếp tục mua sắm nhé!</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary font-bold hover:underline bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary/10 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            /* Cart Item List */
            <div className="space-y-1">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer (Sticky Bottom) */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-card border-t border-border/40 p-5 space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
            {/* Price Calculations */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>Tạm tính:</span>
                <span className="font-semibold text-foreground">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600 font-semibold">
                  <span>Giảm giá:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base sm:text-lg border-t border-border/30 pt-2.5">
                <span>Tổng cộng:</span>
                <span className="text-primary">{total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all text-xs sm:text-sm uppercase tracking-wider"
              >
                Xem giỏ hàng chi tiết
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-border/60 text-muted-foreground hover:text-foreground font-bold py-3 rounded-2xl hover:bg-muted/80 transition-colors text-xs sm:text-sm uppercase tracking-wider"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}