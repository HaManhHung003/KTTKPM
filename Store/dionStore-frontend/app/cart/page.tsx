'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import Footer from '@/components/Footer';
import { ChevronLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items } = useCart();
  const currentStep = 1;

  const steps = [
    { id: 1, name: 'Giỏ hàng', href: '/cart' },
    { id: 2, name: 'Thanh toán', href: '/checkout' },
    { id: 3, name: 'Hoàn tất', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-between">
      <div>
        {/* Minimalist E-Commerce Header */}
        <header className="border-b border-border/50 bg-card/85 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <span className="text-2xl animate-pulse">🐻</span>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Bear Store
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
              <span className="hidden sm:inline">Giao hàng hoả tốc ⚡</span>
              <span className="hidden sm:inline text-muted-foreground/40">•</span>
              <span>Đổi trả 7 ngày dễ dàng 🔄</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Checkout Steps Progress Bar */}
          <div className="max-w-xl mx-auto mb-10 px-4 mt-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 z-0"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/20' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/25 scale-110 shadow-md shadow-primary/20' 
                            : 'bg-card text-muted-foreground border border-border/80'
                      }`}
                    >
                      {isCompleted ? '✓' : step.id}
                    </div>
                    <span className={`text-xs mt-2 font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {items.length === 0 ? (
            /* Empty Cart View with Cute Mascot */
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
              <div className="relative mb-6">
                <div className="text-6xl animate-bounce duration-1000">🐻</div>
                <div className="absolute -bottom-1 -right-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  Huhu...
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng của bạn đang trống</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Bé gấu đang đợi bạn chọn sản phẩm. Hãy lấp đầy giỏ hàng bằng những sản phẩm tuyệt vời nhé!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ChevronLeft size={18} />
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            /* Cart Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Product List Card */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border/40 bg-muted/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <ShoppingBag size={20} className="text-primary" />
                      Sản phẩm trong giỏ ({items.length})
                    </h2>
                    <Link
                      href="/"
                      className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      <ChevronLeft size={14} />
                      Thêm sản phẩm
                    </Link>
                  </div>
                  <div className="divide-y divide-border/40 px-6">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Side Card */}
              <div className="lg:col-span-1">
                <OrderSummary showCheckoutButton={true} />
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}