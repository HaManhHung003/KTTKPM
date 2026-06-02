'use client'

import { MapPin, Phone, Mail, Heart } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16" style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                🐻
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Bear Store</h3>
                <p className="text-[10px] text-white/70">Mua sắm thả ga 🛍️</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Cửa hàng trực tuyến đáng yêu với hàng ngàn sản phẩm chất lượng cao, giao hàng nhanh toàn quốc.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Dịch vụ khách hàng</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="#" className="hover:text-white transition-colors">Liên hệ chúng tôi</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Bảo mật thông tin</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="#" className="hover:text-white transition-colors">Giới thiệu</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Tin tức</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Tuyển dụng</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Liên hệ</h4>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex gap-3 items-start">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/60" />
                <span>123 Đường Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone className="h-4 w-4 text-white/60" />
                <span>1900 1234</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail className="h-4 w-4 text-white/60" />
                <span>support@bearstore.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-white/70">
            <p>© 2024 Bear Store 🐻. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-300 fill-red-300" /> by Bear Store Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
