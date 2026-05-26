'use client'

import { MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">dionStore</h3>
            <p className="text-sm opacity-90">
              Cửa hàng trực tuyến hàng đầu cung cấp thiết bị điện tử, mỹ phẩm, thời trang và sách chất lượng cao.
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Liên hệ chúng tôi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Bảo mật thông tin
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-semibold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-start">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Đường Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone className="h-4 w-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail className="h-4 w-4" />
                <span>support@dionstore.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="text-center text-sm opacity-90">
            <p>&copy; 2024 dionStore. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
