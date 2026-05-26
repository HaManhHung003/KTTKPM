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
    user?.role === 'Admin' ||
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
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">dionStore</h1>
            </Link>

            <div className="flex-1 hidden md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm thiết bị, mỹ phẩm, sách..."
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-secondary"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-foreground">
                        {user.email.split('@')[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                      >
                        <LogOut className="h-2 w-2" /> Đăng xuất
                      </button>
                    </div>
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary border border-border">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                        Đăng nhập
                      </Link>
                      <Link href="/register" className="text-xs text-muted-foreground hover:text-primary">
                        Đăng ký
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>

              <Link href={isAdmin ? '/admin/chat' : '/chat'}>
                <Button variant="ghost" size="icon" className="relative" title="Chat hỗ trợ">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden mt-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-secondary"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {cartOpen && <CartDrawer setIsOpen={setCartOpen} />}
    </>
  )
}
