'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl overflow-hidden mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
        {}
        <div className="space-y-4">
          <div className="inline-block bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Khuyến mãi 14/2026
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Đại Tiệc Công Nghệ & Đời Sống
          </h2>
          <p className="text-lg text-muted-foreground">
            Giảm giá lên đến 50% cho các sản phẩm thiết bị điện tử, thời trang và mỹ phẩm chính hãng.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white mt-4">
            Mua ngay
          </Button>
        </div>

        {}
        <div className="relative h-64 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-lg overflow-hidden">
            <Image
              src="/thumbnail.webp"
              alt="Sản phẩm khuyến mãi"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
