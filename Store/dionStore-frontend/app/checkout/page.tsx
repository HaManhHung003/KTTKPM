'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { ChevronLeft, ShoppingBag, Truck, CreditCard, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart, couponCode } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      router.push('/login?from=/checkout');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
        });
      } catch (err) {
        console.error('Error fetching user info:', err);
        // If token is invalid, redirect to login
        Cookies.remove('accessToken');
        router.push('/login?from=/checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (items.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      setSubmitting(false);
      return;
    }

    const shipping = subtotal > 500000 ? 0 : 30000;
    const finalTotal = total + shipping;

    const orderData = {
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      total: finalTotal,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response = await api.post('/orders', orderData);
      clearCart();
      router.push(`/checkout/success?id=${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const shipping = subtotal > 500000 ? 0 : 30000;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={20} />
              <span className="font-medium">Quay lại giỏ hàng</span>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary" size={24} />
              <span className="text-xl font-bold">dionStore</span>
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2">
                <Truck className="text-primary" size={20} />
                <CardTitle className="text-xl">Thông tin nhận hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên người nhận</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập họ tên đầy đủ"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email nhận thông báo</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Chúng tôi sẽ gửi email xác nhận đơn hàng vào địa chỉ này.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại liên lạc"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ chi tiết</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2">
                <CreditCard className="text-primary" size={20} />
                <CardTitle className="text-xl">Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-lg">
                  <div className="w-5 h-5 rounded-full border-4 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-muted-foreground">Bạn chỉ thanh toán khi nhận được hàng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg opacity-50 grayscale">
                  <div className="w-5 h-5 rounded-full border border-border"></div>
                  <div className="flex-1">
                    <p className="font-bold">Chuyển khoản ngân hàng (Sắp ra mắt)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <Card className="border-border/50 shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  Tóm tắt đơn hàng
                  <span className="text-sm font-normal text-muted-foreground">{items.length} sản phẩm</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-bold text-right">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        `${shipping.toLocaleString('vi-VN')}₫`
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá ({couponCode}):</span>
                      <span className="text-green-600 font-medium">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  form="checkout-form" 
                  className="w-full py-6 text-lg font-bold" 
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang đặt hàng...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Xác nhận đặt hàng
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
