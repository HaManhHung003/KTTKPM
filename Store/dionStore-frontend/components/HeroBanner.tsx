'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-12" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fde68a 100%)' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d97706, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-14 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-amber-200 shadow-sm">
            🎉 Khuyến mãi tháng 6/2026
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-amber-900 leading-tight">
            Mua Sắm Vui Vẻ<br />
            <span className="text-amber-600">Cùng Bear Store 🐻</span>
          </h2>
          <p className="text-lg text-amber-800/70">
            Giảm giá lên đến <strong>50%</strong> cho hàng ngàn sản phẩm chất lượng cao — giao hàng nhanh toàn quốc.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/categories">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-full px-8">
                🛍️ Mua ngay
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50 font-semibold rounded-full px-8">
                Xem tất cả
              </Button>
            </Link>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">10K+</p>
              <p className="text-xs text-amber-600">Sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">50K+</p>
              <p className="text-xs text-amber-600">Khách hàng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">4.9⭐</p>
              <p className="text-xs text-amber-600">Đánh giá</p>
            </div>
          </div>
        </div>

        <div className="relative h-64 md:h-96 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-[160px] md:text-[220px] select-none" style={{ filter: 'drop-shadow(0 20px 40px rgba(217,119,6,0.3))' }}>
                🐻
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 text-sm font-semibold text-amber-700 border border-amber-100 animate-bounce">
            🎁 Freeship hôm nay!
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 text-sm font-semibold text-green-700 border border-green-100">
            ✅ Đã giao 1,234 đơn hôm nay
          </div>
        </div>
      </div>
    </div>
  )
}
