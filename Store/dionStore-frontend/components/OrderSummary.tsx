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
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Tóm tắt đơn hàng</h2>
      </div>

      <div className="p-6 space-y-4">
        {}
        <div className="flex justify-between text-muted-foreground">
          <span>Tạm tính</span>
          <span className="font-medium text-foreground">
            {subtotal.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <div className="flex items-center gap-1">
              <span>Giảm giá</span>
              {couponCode && (
                <span className="text-xs bg-green-100 px-2 py-0.5 rounded">
                  {couponCode}
                </span>
              )}
            </div>
            <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground">
          <span>Phí vận chuyển</span>
          <span className="font-medium text-foreground">
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
          </span>
        </div>

        <div className="pt-4 border-t border-border flex justify-between items-end">
          <div>
            <p className="text-sm text-muted-foreground">Tổng cộng</p>
            <p className="text-xs text-muted-foreground">(Đã bao gồm VAT)</p>
          </div>
          <span className="text-2xl font-bold text-primary">
            {total.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {}
        <div className="pt-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Mã giảm giá
          </label>
          
          {couponCode ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Ticket size={18} />
                <span className="font-bold">{couponCode}</span>
              </div>
              <button 
                onClick={removeCoupon}
                className="text-green-700 hover:text-green-900"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Nhập mã (Ví dụ: DION50)"
                  className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Áp dụng
              </button>
            </div>
          )}
          
          {message && (
            <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>

        {}
        {showCheckoutButton && (
          <Link 
            href="/checkout"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-4 group"
          >
            TIẾN HÀNH THANH TOÁN
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
        
        <p className="text-xs text-center text-muted-foreground">
          Bằng cách nhấn thanh toán, bạn đồng ý với các Điều khoản & Chính sách của Dion Store.
        </p>
      </div>
    </div>
  );
}
