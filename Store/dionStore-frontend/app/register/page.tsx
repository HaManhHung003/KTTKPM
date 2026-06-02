'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Mail, Lock, Eye, EyeOff, ShoppingBag, AlertCircle, User, Phone, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  
  const passwordRules = [
    { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Có số (0-9)', valid: /[0-9]/.test(password) },
  ]

  const isPasswordValid = passwordRules.every(rule => rule.valid)
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    
    const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ (ví dụ: 0912345678)')
      return
    }

    
    if (!isPasswordValid) {
      setError('Mật khẩu chưa đạt yêu cầu')
      return
    }

    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      })

      if (response.status >= 200 && response.status < 300) {
        const loginQuery = new URLSearchParams({
          registered: '1',
          email,
        })
        router.push(`/login?${loginQuery.toString()}`)
      }
      router.refresh()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status
        const apiMessage = err.response?.data?.error

        if (statusCode === 409) {
          setError('Email đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.')
        } else if (typeof apiMessage === 'string' && /exist|already/i.test(apiMessage)) {
          setError('Tài khoản đã tồn tại. Vui lòng đăng nhập.')
        } else {
          setError(apiMessage || 'Đăng ký thất bại. Vui lòng thử lại.')
        }
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 py-8">
      <div className="w-full max-w-md">
        {}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">DionStore</span>
          </div>
          <p className="text-muted-foreground text-sm">Mua sắm thông minh, sống chất lượng</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold">Tạo tài khoản</CardTitle>
            <CardDescription>Tham gia DionStore ngay hôm nay</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {}
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="0912345678"
                    className="pl-10"
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {}
                {password.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {passwordRules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {rule.valid ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={rule.valid ? 'text-green-500' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {isPasswordMatch ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Mật khẩu khớp</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">Mật khẩu không khớp</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isPasswordValid || !isPasswordMatch}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Link href="/terms" className="underline hover:text-foreground">Điều khoản dịch vụ</Link>
          {' '}và{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Chính sách bảo mật</Link>
        </p>
      </div>
    </div>
  )
}
