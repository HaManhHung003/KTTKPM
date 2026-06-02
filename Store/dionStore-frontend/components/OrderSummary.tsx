'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Ticket, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface OrderSummaryProps {
  showCheckoutButton?: boolean;
}

export default function OrderSummary({ showCheckoutButton = true }: OrderSummaryProps) {
  const { 
    subtotal, 
    total, 
    discountAmount, 
    couponCode, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    
    const result = applyCoupon(couponInput);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
      setCouponInput('');
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const shippingFee: number = 0; 

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm sticky top-24">
      <div className="p-6 border-b border-border/40 bg-muted/10">
        <h2 className="text-lg font-bold text-foreground">Tóm tắt đơn hàng</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Tạm tính</span>
          <span className="font-semibold text-foreground">
            {subtotal.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Discount Amount */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <div className="flex items-center gap-1">
              <span>Giảm giá</span>
              {couponCode && (
                <span className="text-[10px] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  {couponCode}
                </span>
              )}
            </div>
            <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
          </div>
        )}

        {/* Shipping Fee */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-green-600">
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
          </span>
        </div>

        {/* Total Price */}
        <div className="pt-4 border-t border-border/40 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-foreground">Tổng cộng</p>
            <p className="text-[10px] text-muted-foreground">(Đã bao gồm VAT)</p>
          </div>
          <span className="text-2xl font-extrabold text-primary">
            {total.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Coupon Input Section */}
        <div className="pt-4 border-t border-border/40">
          <label className="text-xs font-bold text-foreground mb-2 block uppercase tracking-wider">
            Mã giảm giá
          </label>
          
          {couponCode ? (
            <div className="flex items-center justify-between bg-green-50/50 border border-green-200/80 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <Ticket size={16} />
                <span className="font-bold">{couponCode}</span>
              </div>
              <button 
                onClick={removeCoupon}
                className="text-green-700 hover:text-green-900 p-1 hover:bg-green-100 rounded-full transition-colors"
                aria-label="Xóa mã giảm giá"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Nhập mã (Ví dụ: BEAR50)"
                  className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
                <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
              >
                Áp dụng
              </button>
            </div>
          )}
          
          {message && (
            <p className={`text-xs mt-2 font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>

        {/* Checkout Button */}
        {showCheckoutButton && (
          <Link 
            href="/checkout"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md group mt-5 text-sm uppercase tracking-wider"
          >
            🐻 TIẾN HÀNH THANH TOÁN
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        )}
        
        <p className="text-[10px] text-center text-muted-foreground pt-2">
          Bằng cách nhấn thanh toán, bạn đồng ý với các Điều khoản & Chính sách của Bear Store 🐻.
        </p>
      </div>
    </div>
  );
}
