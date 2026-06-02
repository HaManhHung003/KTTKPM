'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { ChevronLeft, Truck, CreditCard, CheckCircle2, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart, couponCode } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');

  const currentStep = 2;
  const steps = [
    { id: 1, name: 'Giỏ hàng', href: '/cart' },
    { id: 2, name: 'Thanh toán', href: '/checkout' },
    { id: 3, name: 'Hoàn tất', href: '#' },
  ];

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <div className="relative mb-4">
          <div className="text-5xl animate-bounce">🐻</div>
          <Loader2 className="w-8 h-8 animate-spin text-primary absolute -bottom-2 -right-2" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  const shipping = subtotal > 500000 ? 0 : 30000;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-between">
      <div>
        {/* Minimalist E-Commerce Header */}
        <header className="border-b border-border/50 bg-card/85 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ChevronLeft size={18} />
              <span>Giỏ hàng</span>
            </Link>
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <span className="text-2xl">🐻</span>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Bear Store
              </span>
            </Link>
            <div className="w-16"></div> {/* Spacer to keep center alignment */}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Checkout Steps Progress Bar */}
          <div className="max-w-xl mx-auto mb-10 px-4 mt-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 z-0"
                style={{ width: '50%' }}
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

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-foreground">Thanh toán đơn hàng</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Customer Info and Payment Method Forms */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Information Card */}
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2.5 bg-muted/10 border-b border-border/40 py-5">
                  <div className="p-2 bg-amber-500/10 text-primary rounded-lg">
                    <Truck size={18} className="stroke-[2.5]" />
                  </div>
                  <CardTitle className="text-lg font-bold">Thông tin nhận hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Họ và tên người nhận</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên đầy đủ"
                        required
                        className="h-11 rounded-xl border-border/75 focus-visible:ring-primary/25 focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email nhận thông báo</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                        className="h-11 rounded-xl border-border/75 focus-visible:ring-primary/25 focus-visible:border-primary"
                      />
                      <p className="text-[10px] text-muted-foreground">Chúng tôi sẽ gửi email xác nhận đơn hàng vào địa chỉ này.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Số điện thoại liên lạc"
                        required
                        className="h-11 rounded-xl border-border/75 focus-visible:ring-primary/25 focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ chi tiết</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        className="min-h-[100px] rounded-xl border-border/75 focus-visible:ring-primary/25 focus-visible:border-primary"
                        required
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Payment Method Card */}
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2.5 bg-muted/10 border-b border-border/40 py-5">
                  <div className="p-2 bg-amber-500/10 text-primary rounded-lg">
                    <CreditCard size={18} className="stroke-[2.5]" />
                  </div>
                  <CardTitle className="text-lg font-bold">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3.5 p-4 border-2 border-primary bg-amber-500/[0.04] rounded-2xl transition-all duration-200">
                    <div className="w-5 h-5 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm sm:text-base">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-muted-foreground">Bạn chỉ thanh toán bằng tiền mặt khi nhận được hàng</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 p-4 border border-border/60 rounded-2xl opacity-50 bg-muted/10 cursor-not-allowed">
                    <div className="w-5 h-5 rounded-full border border-border/60 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-muted-foreground">Chuyển khoản ngân hàng (Sắp ra mắt)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Side Card */}
            <div className="lg:col-span-5">
              <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden sticky top-24">
                <CardHeader className="border-b border-border/40 bg-muted/10 py-5">
                  <CardTitle className="text-lg font-bold flex justify-between items-center">
                    Tóm tắt đơn hàng
                    <span className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{items.length} sản phẩm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Item List with custom scrollbar */}
                  <div className="max-h-[260px] overflow-y-auto pr-1.5 space-y-4 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3.5 items-center">
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/40 shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-extrabold text-foreground text-right pl-2">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Calculations */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tạm tính</span>
                      <span className="font-medium text-foreground">{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Phí vận chuyển</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600 font-bold">Miễn phí</span>
                        ) : (
                          <span className="font-medium text-foreground">{shipping.toLocaleString('vi-VN')}₫</span>
                        )}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Giảm giá ({couponCode})</span>
                        <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-foreground">Tổng cộng</span>
                    <span className="text-2xl font-extrabold text-primary">{finalTotal.toLocaleString('vi-VN')}₫</span>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50 text-red-800">
                      <AlertCircle className="h-4 w-4 stroke-red-600" />
                      <AlertTitle className="font-bold text-red-900">Lỗi đặt hàng</AlertTitle>
                      <AlertDescription className="text-xs text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/5 border-t border-border/40">
                  <Button 
                    type="submit" 
                    form="checkout-form" 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/25 py-6 text-sm uppercase tracking-wider font-extrabold rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] gap-1.5" 
                    disabled={submitting || items.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đặt hàng...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4.5 w-4.5" />
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
      <Footer />
    </div>
  );
}
