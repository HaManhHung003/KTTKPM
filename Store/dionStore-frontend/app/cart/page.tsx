'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import { ChevronLeft, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Quay lại</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={24} />
              Giỏ hàng
            </h1>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          
          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <ShoppingCart size={64} className="text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng của bạn trống</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Hãy thêm sản phẩm yêu thích vào giỏ hàng của bạn để bắt đầu mua sắm
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ChevronLeft size={18} />
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">
                    Sản phẩm trong giỏ ({items.length})
                  </h2>
                </div>
                <div className="divide-y divide-border m-6">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/"
                  className="text-primary font-medium hover:underline text-sm"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {}
            <div className="lg:col-span-1">
              <OrderSummary showCheckoutButton={true} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}