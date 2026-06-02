'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { LogOut, MessageSquare, Search, ShoppingCart, User as UserIcon } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import type { User } from '@/lib/types'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const router = useRouter()
  const { items } = useCart()

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('accessToken')
      if (token) {
        try {
          const response = await api.get('/auth/me')
          setUser(response.data)
        } catch (err) {
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.authorities?.some((authority) => authority.authority === 'ROLE_ADMIN')

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">

            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:scale-105 transition-transform">
                🐻
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-extrabold text-primary tracking-tight">Bear Store</span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Mua sắm thả ga 🛍️</span>
              </div>
            </Link>

            <div className="flex-1 hidden md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm yêu thích..."
                  className="w-full px-4 py-2.5 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-secondary text-sm"
                />
                <div className="absolute right-2 top-1.5 bg-primary rounded-full p-1">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-foreground">
                        {user.email.split('@')[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                      >
                        <LogOut className="h-2 w-2" /> Đăng xuất
                      </button>
                    </div>
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                        Đăng nhập
                      </Link>
                      <Link href="/register" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Đăng ký
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 rounded-full"
                onClick={() => setCartOpen(true)}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>

              <Link href={isAdmin ? '/admin/chat' : '/chat'}>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-full" title="Chat hỗ trợ">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden mt-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2.5 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-secondary text-sm"
              />
              <div className="absolute right-2 top-1.5 bg-primary rounded-full p-1">
                <Search className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {cartOpen && <CartDrawer setIsOpen={setCartOpen} />}
    </>
  )
}
