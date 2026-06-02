'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="text-green-600 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground mt-2">
            Cảm ơn bạn đã mua sắm tại dionStore. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="flex justify-between items-center text-lg">
              Thông tin đơn hàng
              <span className="text-primary">#{orderId || 'N/A'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6 space-y-6">
            {order ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Người nhận</p>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ngày đặt</p>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar size={14} className="text-muted-foreground" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Địa chỉ giao hàng</p>
                    <p className="text-sm">{order.address}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sản phẩm</p>
                  <div className="space-y-3">
                    {order.details && order.details.map((detail: any) => (
                      <div key={detail.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                            {detail.product?.image ? (
                              <img src={detail.product.image} alt={detail.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="text-muted-foreground w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{detail.product?.name || 'Sản phẩm không xác định'}</p>
                            <p className="text-xs text-muted-foreground">x{detail.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">{(detail.sellingPrice * detail.quantity).toLocaleString('vi-VN')}₫</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-bold">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-primary">{(order.totalSellingAmount || 0).toLocaleString('vi-VN')}₫</span>
                </div>
              </>
            ) : loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Không tìm thấy thông tin chi tiết đơn hàng.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/20 border-t border-border/50 py-6">
            <Link href="/" className="w-full sm:flex-1">
              <Button variant="outline" className="w-full">
                Tiếp tục mua sắm
              </Button>
            </Link>
            <Link href="/orders" className="w-full sm:flex-1">
              <Button className="w-full">
                Xem đơn hàng của tôi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border/50 flex gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="text-primary w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Kiểm tra Email</h4>
              <p className="text-xs text-muted-foreground mt-1">Chúng tôi đã gửi một email xác nhận đến hòm thư của bạn.</p>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border/50 flex gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck className="text-primary w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Theo dõi giao hàng</h4>
              <p className="text-xs text-muted-foreground mt-1">Bạn sẽ nhận được thông báo khi đơn hàng bắt đầu được giao.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
