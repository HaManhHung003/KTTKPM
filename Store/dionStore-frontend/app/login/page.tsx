'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import axios from 'axios'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const secureCookieOptions = {
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  const redirectParam = searchParams.get('from')
  const from = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
    ? redirectParam
    : '/'

  useEffect(() => {
    const registered = searchParams.get('registered')
    const suggestedEmail = searchParams.get('email')
    if (registered === '1') {
      setMessage('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.')
    }
    if (suggestedEmail) {
      setEmail(suggestedEmail)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      Cookies.set('accessToken', response.data.accessToken, { expires: 1 / 96, ...secureCookieOptions })
      Cookies.set('refreshToken', response.data.refreshToken, { expires: 7, ...secureCookieOptions })
      const userRole = response.data.user?.role
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        router.push(from)
      }
      router.refresh()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 60%, #fde68a 100%)' }}>
      {/* Left panel — decoration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, #f59e0b, transparent 60%), radial-gradient(circle at 80% 80%, #d97706, transparent 50%)' }} />
        <div className="relative text-center space-y-6">
          <div className="text-[120px] leading-none select-none" style={{ filter: 'drop-shadow(0 20px 40px rgba(217,119,6,0.25))' }}>
            🐻
          </div>
          <h2 className="text-4xl font-extrabold text-amber-900">Bear Store</h2>
          <p className="text-amber-700 text-lg max-w-xs">Mua sắm thả ga, giá hợp lý — hàng ngàn sản phẩm đang chờ bạn!</p>
          <div className="flex gap-4 justify-center">
            <div className="bg-white/60 backdrop-blur rounded-2xl px-5 py-3 text-center shadow">
              <p className="text-2xl font-bold text-amber-700">10K+</p>
              <p className="text-xs text-amber-600">Sản phẩm</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl px-5 py-3 text-center shadow">
              <p className="text-2xl font-bold text-amber-700">50K+</p>
              <p className="text-xs text-amber-600">Khách hàng</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl px-5 py-3 text-center shadow">
              <p className="text-2xl font-bold text-amber-700">4.9⭐</p>
              <p className="text-xs text-amber-600">Đánh giá</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl shadow-lg">
                🐻
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-amber-800">Bear Store</h1>
                <p className="text-xs text-amber-600">Mua sắm thả ga 🛍️</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại! 👋</h2>
              <p className="text-gray-500 text-sm mt-1">Đăng nhập vào tài khoản Bear Store của bạn</p>
            </div>

            {message && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-700 rounded-2xl">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200 text-red-600 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 hover:underline font-medium">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  '🐻 Đăng nhập'
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Hoặc</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
                Đăng ký ngay 🎉
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-amber-700/60 mt-5">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="underline hover:text-amber-800">Điều khoản dịch vụ</Link>
            {' '}và{' '}
            <Link href="/privacy" className="underline hover:text-amber-800">Chính sách bảo mật</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)' }}>
        <div className="text-center space-y-3">
          <div className="text-6xl animate-bounce">🐻</div>
          <Spinner className="w-8 h-8 mx-auto" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
