'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentStep = 3;
  const steps = [
    { id: 1, name: 'Giỏ hàng', href: '/cart' },
    { id: 2, name: 'Thanh toán', href: '/checkout' },
    { id: 3, name: 'Hoàn tất', href: '#' },
  ];

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const response = await api.get(`/orders/${orderId}`);
          setOrder(response.data);
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

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
            <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-3.5 py-1.5 rounded-full border border-green-100">
              <span>Đặt hàng an toàn 100% ✓</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Checkout Steps Progress Bar */}
          <div className="max-w-xl mx-auto mb-10 px-4 mt-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 z-0"
                style={{ width: '100%' }}
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

          {/* Success Banner */}
          <div className="text-center mb-10 mt-2">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-600 w-11 h-11" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 text-4xl animate-bounce">🎉</div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Đặt hàng thành công!</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Cảm ơn bạn đã mua sắm tại <span className="font-bold text-foreground">Bear Store 🐻</span>. Đơn hàng của bạn đang được xử lý và chuẩn bị giao.
            </p>
          </div>

          {/* Order Details Receipt Card */}
          <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden mb-8">
            <CardHeader className="bg-muted/10 border-b border-border/40 py-5 px-6">
              <CardTitle className="flex justify-between items-center text-base sm:text-lg font-bold">
                Chi tiết đơn hàng
                <span className="text-primary font-extrabold text-sm bg-primary/5 px-3 py-1 rounded-full">#{orderId || 'N/A'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {order ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border/30">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Người nhận</p>
                      <p className="font-bold text-sm text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Ngày đặt hàng</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Calendar size={13} className="text-muted-foreground" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1 pt-1.5 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Địa chỉ giao hàng</p>
                      <p className="text-xs font-semibold text-foreground leading-relaxed">{order.address}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Sản phẩm đã mua</p>
                    <div className="space-y-3 divide-y divide-border/20">
                      {order.details && order.details.map((detail: any, idx: number) => (
                        <div key={detail.id} className={`flex justify-between items-center ${idx > 0 ? 'pt-3' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden border border-border/40">
                              {detail.product?.image ? (
                                <img src={detail.product.image} alt={detail.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="text-muted-foreground w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">{detail.product?.name || 'Sản phẩm không xác định'}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Số lượng: x{detail.quantity}</p>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-foreground pl-2">{(detail.sellingPrice * detail.quantity).toLocaleString('vi-VN')}₫</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm sm:text-base">Tổng thanh toán</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-primary">{(order.totalSellingAmount || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                </>
              ) : loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-xs text-muted-foreground font-semibold">Đang tải thông tin đơn hàng...</p>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Không tìm thấy thông tin chi tiết đơn hàng.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/10 border-t border-border/40 p-6">
              <Link href="/" className="w-full sm:flex-1">
                <Button variant="outline" className="w-full h-11 rounded-xl font-bold hover:bg-muted text-foreground transition-colors border-border/60">
                  Tiếp tục mua sắm
                </Button>
              </Link>
              <Link href="/admin/orders" className="w-full sm:flex-1"> {/* Adjust as appropriate, typically customer orders dashboard */}
                <Button className="w-full h-11 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-500/10 text-white transition-all gap-1">
                  Xem đơn hàng của tôi
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Quick Notice Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-4.5 rounded-2xl border border-border/50 flex gap-3.5 shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                <Package className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-foreground">Kiểm tra Email</h4>
                <p className="text-xs text-muted-foreground leading-normal">Hệ thống đã gửi email xác nhận chi tiết đến hộp thư của bạn.</p>
              </div>
            </div>
            <div className="bg-card p-4.5 rounded-2xl border border-border/50 flex gap-3.5 shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-foreground">Theo dõi giao hàng</h4>
                <p className="text-xs text-muted-foreground leading-normal">Nhân viên Bear Store sẽ sớm liên lạc để xác minh giao hàng.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
