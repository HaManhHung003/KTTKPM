'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { connectChat, unsubscribeTopic } from '@/lib/chat'
import type { ChatMessage } from '@/lib/types'
import AdminChatPanel from '@/components/AdminChatPanel'
import AiChatBox from './components/AiChatBox'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  Edit,
  PlusCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Package,
  Tag,
  LogOut,
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  DollarSign,
  User,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, startOfYear, endOfYear, isSameDay, isSameMonth } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  costPrice: number
  sellingPrice: number
  quantity: number
  description: string
  image: string
  category: Category
  createdAt: string
  published: boolean
}

interface FormState {
  name: string
  costPrice: string
  sellingPrice: string
  quantity: string
  description: string
  image: string
  categoryId: string
  published: boolean
}

interface OrderDetail {
  id: number
  product: { id: number, name: string, image: string }
  quantity: number
  costPrice: number
  sellingPrice: number
}

interface Order {
  id: number
  customerName: string
  email: string
  phone: string
  address: string
  totalSellingAmount: number
  status: string
  createdAt: string
  details: OrderDetail[]
}

const emptyForm: FormState = {
  name: '',
  costPrice: '',
  sellingPrice: '',
  quantity: '',
  description: '',
  image: '',
  categoryId: '',
  published: false,
}

export default function AdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [activeTab, setActiveTab] = useState<'statistics' | 'products' | 'categories' | 'orders' | 'chat'>('statistics')
  const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'year'>('week')
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const activeTabRef = useRef(activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
    if (activeTab === 'chat') {
      setUnreadChatCount(0)
    }
  }, [activeTab])

  // Category CRUD state
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false)
  const [catDeleteTarget, setCatDeleteTarget] = useState<Category | null>(null)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState({ name: '' })

  // Order state
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchOrders()

    // Global Admin Chat Notification Listener
    connectChat(
      'admin',
      (msg: ChatMessage) => {
        if (msg.senderRole === 'customer') {
          if (activeTabRef.current !== 'chat') {
            setUnreadChatCount(prev => prev + 1)
          }
          toast(`Tin nhắn từ khách hàng`, {
            description: msg.message,
            action: {
              label: 'Xem',
              onClick: () => setActiveTab('chat')
            }
          });
        }
      },
      () => console.log('Connected to admin global notifications')
    )

    // Poll for new orders every 30 seconds
    const orderInterval = setInterval(() => {
      fetchOrders()
    }, 30000)

    return () => {
      unsubscribeTopic('admin');
      clearInterval(orderInterval);
    }
  }, [])

  // ───── API Calls ─────
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<Product[]>('/admin/products')
      setProducts(data)
    } catch {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get<Category[]>('/categories')
      setCategories(data)
    } catch {
      toast.error('Không thể tải danh mục')
    }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await api.get<Order[]>('/admin/orders')
      setOrders(data)
    } catch {
      toast.error('Không thể tải danh sách đơn hàng')
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status })
      toast.success('Cập nhật trạng thái đơn hàng thành công!')
      fetchOrders()
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(prev => prev ? { ...prev, status } : prev)
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái đơn hàng')
    }
  }

  const handleSubmitProduct = async () => {
    if (!formState.name.trim()) { toast.error('Tên sản phẩm không được để trống'); return }
    if (!formState.costPrice || isNaN(Number(formState.costPrice))) { toast.error('Giá gốc không hợp lệ'); return }
    if (!formState.sellingPrice || isNaN(Number(formState.sellingPrice))) { toast.error('Giá bán không hợp lệ'); return }
    if (!formState.categoryId) { toast.error('Vui lòng chọn danh mục'); return }

    setSaving(true)
    try {
      const payload = {
        name: formState.name.trim(),
        costPrice: parseFloat(formState.costPrice),
        sellingPrice: parseFloat(formState.sellingPrice),
        quantity: parseInt(formState.quantity) || 0,
        description: formState.description,
        image: formState.image,
        category: { id: parseInt(formState.categoryId) },
        published: formState.published,
      }

      if (currentProduct) {
        await api.put(`/admin/products/${currentProduct.id}`, payload)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        await api.post('/admin/products', payload)
        toast.success('Thêm sản phẩm mới thành công!')
      }
      setIsDialogOpen(false)
      fetchProducts()
    } catch {
      toast.error(currentProduct ? 'Lỗi khi cập nhật sản phẩm' : 'Lỗi khi thêm sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`)
      toast.success('Xóa sản phẩm thành công!')
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      toast.error('Lỗi khi xóa sản phẩm')
    }
  }

  const handleTogglePublish = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}/publish?publish=${!product.published}`)
      toast.success(`${!product.published ? 'Đã publish' : 'Đã ẩn'} sản phẩm!`)
      fetchProducts()
    } catch {
      toast.error('Lỗi khi thay đổi trạng thái')
    }
  }

  // ───── Category CRUD ─────
  const handleSubmitCategory = async () => {
    if (!catForm.name.trim()) { toast.error('Tên danh mục không được để trống'); return }
    setSaving(true)
    try {
      if (currentCategory) {
        await api.put(`/admin/categories/${currentCategory.id}`, { name: catForm.name.trim() })
        toast.success('Cập nhật danh mục thành công!')
      } else {
        await api.post('/admin/categories', { name: catForm.name.trim() })
        toast.success('Thêm danh mục thành công!')
      }
      setIsCatDialogOpen(false)
      fetchCategories()
    } catch {
      toast.error(currentCategory ? 'Lỗi khi cập nhật danh mục' : 'Lỗi khi thêm danh mục')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!catDeleteTarget) return
    try {
      await api.delete(`/admin/categories/${catDeleteTarget.id}`)
      toast.success('Xóa danh mục thành công!')
      setCatDeleteTarget(null)
      fetchCategories()
    } catch {
      toast.error('Không thể xóa danh mục (có thể đang được dùng bởi sản phẩm)')
    }
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    router.push('/login')
  }

  // ───── UI Helpers ─────
  const openAddProduct = () => {
    setCurrentProduct(null)
    setFormState(emptyForm)
    setIsDialogOpen(true)
  }

  const openEditProduct = (p: Product) => {
    setCurrentProduct(p)
    setFormState({
      name: p.name,
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      quantity: String(p.quantity),
      description: p.description || '',
      image: p.image || '',
      categoryId: p.category ? String(p.category.id) : '',
      published: p.published,
    })
    setIsDialogOpen(true)
  }

  const openAddCategory = () => {
    setCurrentCategory(null)
    setCatForm({ name: '' })
    setIsCatDialogOpen(true)
  }

  const openEditCategory = (c: Category) => {
    setCurrentCategory(c)
    setCatForm({ name: c.name })
    setIsCatDialogOpen(true)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const inventoryValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0)
  const publishedCount = products.filter(p => p.published).length

  // Statistics Computations
  const completedOrdersList = orders.filter(o => o.status === 'completed')
  const actualRevenue = completedOrdersList.reduce((sum, o) => sum + o.totalSellingAmount, 0)
  const actualCost = completedOrdersList.reduce((sum, o) => sum + (o.details?.reduce((s, d) => s + (d.costPrice * d.quantity), 0) || 0), 0)
  const actualProfit = actualRevenue - actualCost

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length

  // Order Status Pie Chart Data
  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const orderStatusData = Object.entries(orderStatusCounts).map(([status, count]) => ({
    name: status === 'pending' ? 'Chờ xử lý' : 
          status === 'confirmed' ? 'Đã xác nhận' : 
          status === 'shipping' ? 'Đang giao' : 
          status === 'completed' ? 'Hoàn thành' : 'Đã hủy',
    value: count
  }))

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

  // Revenue Bar Chart Data
  const getRevenueData = () => {
    const today = new Date()
    const completedOrders = orders.filter(o => o.status === 'completed')
    
    if (chartFilter === 'week') {
      const start = subDays(today, 6)
      const days = eachDayOfInterval({ start, end: today })
      return days.map(day => {
        const ordersOfDay = completedOrders.filter(o => isSameDay(new Date(o.createdAt), day))
        const Doanh_thu = ordersOfDay.reduce((sum, o) => sum + o.totalSellingAmount, 0)
        const Tien_goc = ordersOfDay.reduce((sum, o) => sum + (o.details?.reduce((s, d) => s + (d.costPrice * d.quantity), 0) || 0), 0)
        const Loi_nhuan = Doanh_thu - Tien_goc
        return { name: format(day, 'dd/MM'), Doanh_thu, Tien_goc, Loi_nhuan }
      })
    }
    
    if (chartFilter === 'month') {
      const start = startOfMonth(today)
      const end = endOfMonth(today)
      const days = eachDayOfInterval({ start, end })
      return days.map(day => {
        const ordersOfDay = completedOrders.filter(o => isSameDay(new Date(o.createdAt), day))
        const Doanh_thu = ordersOfDay.reduce((sum, o) => sum + o.totalSellingAmount, 0)
        const Tien_goc = ordersOfDay.reduce((sum, o) => sum + (o.details?.reduce((s, d) => s + (d.costPrice * d.quantity), 0) || 0), 0)
        const Loi_nhuan = Doanh_thu - Tien_goc
        return { name: format(day, 'dd/MM'), Doanh_thu, Tien_goc, Loi_nhuan }
      })
    }
    
    // year
    const startY = startOfYear(today)
    const endY = endOfYear(today)
    const months = eachMonthOfInterval({ start: startY, end: endY })
    return months.map(month => {
      const ordersOfMonth = completedOrders.filter(o => isSameMonth(new Date(o.createdAt), month))
      const Doanh_thu = ordersOfMonth.reduce((sum, o) => sum + o.totalSellingAmount, 0)
      const Tien_goc = ordersOfMonth.reduce((sum, o) => sum + (o.details?.reduce((s, d) => s + (d.costPrice * d.quantity), 0) || 0), 0)
      const Loi_nhuan = Doanh_thu - Tien_goc
      return { name: format(month, 'MMM', { locale: vi }), Doanh_thu, Tien_goc, Loi_nhuan }
    })
  }

  const revenueData = getRevenueData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar + Main Layout */}
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <div className="text-gray-900 font-bold text-sm">DionStore</div>
                <div className="text-blue-400 text-xs">Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('statistics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'statistics'
                  ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Tag className="w-4 h-4" />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                Đơn hàng
              </div>
              {pendingOrdersCount > 0 && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingOrdersCount}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4" />
                Chat Hỗ trợ
              </div>
              {unreadChatCount > 0 && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {unreadChatCount}
                </div>
              )}
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 font-semibold text-lg">
                {activeTab === 'statistics' ? 'Tổng quan Thống kê' : 
                 activeTab === 'products' ? 'Quản lý Sản phẩm' : 
                 activeTab === 'categories' ? 'Quản lý Danh mục' : 
                 activeTab === 'chat' ? 'Hỗ trợ khách hàng' : 'Quản lý Đơn hàng'}
              </h1>
              <p className="text-gray-500 text-sm">dionStore Admin Dashboard</p>
            </div>
            <button
              onClick={() => { fetchProducts(); fetchCategories(); fetchOrders(); }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>

          <div className="p-8">
            {/* ─── STATISTICS TAB ─── */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Doanh thu</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {actualRevenue.toLocaleString('vi-VN')}
                      <span className="text-xs text-gray-500 ml-1 font-semibold underline decoration-2 underline-offset-4">đ</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Tiền gốc</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {actualCost.toLocaleString('vi-VN')}
                      <span className="text-xs text-gray-500 ml-1 font-semibold underline decoration-2 underline-offset-4">đ</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Lợi nhuận</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {actualProfit.toLocaleString('vi-VN')}
                      <span className="text-xs text-gray-500 ml-1 font-semibold underline decoration-2 underline-offset-4">đ</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Đơn hàng</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {orders.length}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Chờ xử lý</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {pendingOrdersCount}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-[12px] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-gray-500 font-medium text-xs sm:text-[13px] leading-tight">Sản phẩm</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline">
                      {products.length}
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Pie Chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-gray-900 font-semibold mb-6">Trạng thái đơn hàng</h3>
                    <div className="h-[300px] w-full">
                      {orderStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={orderStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {orderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Chưa có dữ liệu
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {orderStatusData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                          {entry.name}: {entry.value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Bar Chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-gray-900 font-semibold">Doanh thu</h3>
                      <Select value={chartFilter} onValueChange={(val: any) => setChartFilter(val)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">7 ngày qua</SelectItem>
                          <SelectItem value="month">Tháng này</SelectItem>
                          <SelectItem value="year">Năm nay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                      {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip 
                              formatter={(value: number, name: string) => [`${value.toLocaleString('vi-VN')} ₫`, name.replace('_', ' ')]}
                              cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="Tien_goc" name="Tiền gốc" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Loi_nhuan" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Doanh_thu" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Chưa có dữ liệu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards (chỉ hiện khi tab products) */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-500 text-sm">Tổng sản phẩm</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                  <div className="text-xs text-gray-500 mt-1">{publishedCount} đã publish</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-500 text-sm">Đang hiển thị</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
                  <div className="text-xs text-gray-500 mt-1">{products.length - publishedCount} đang ẩn</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-500 text-sm">Tổng giá trị kho</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {inventoryValue.toLocaleString('vi-VN')}
                    <span className="text-sm text-gray-500 ml-1">₫</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{categories.length} danh mục</div>
                </div>
              </div>
            )}

            {/* ─── CHAT TAB ─── */}
            {activeTab === 'chat' && (
              <AdminChatPanel />
            )}

            {/* ─── PRODUCTS TAB ─── */}
            {activeTab === 'products' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-900 font-medium">Danh sách sản phẩm</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0">
                      {filteredProducts.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 w-52"
                      />
                    </div>
                    <Button
                      onClick={openAddProduct}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-3 text-gray-500">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Đang tải...
                    </div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Package className="w-12 h-12 mb-3 opacity-30" />
                    <p>{search ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-500 font-medium">ID</TableHead>
                          <TableHead className="text-gray-500 font-medium">Sản phẩm</TableHead>
                          <TableHead className="text-gray-500 font-medium">Giá gốc</TableHead>
                          <TableHead className="text-gray-500 font-medium">Giá bán</TableHead>
                          <TableHead className="text-gray-500 font-medium">Kho</TableHead>
                          <TableHead className="text-gray-500 font-medium">Danh mục</TableHead>
                          <TableHead className="text-gray-500 font-medium">Trạng thái</TableHead>
                          <TableHead className="text-gray-500 font-medium text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map(product => (
                          <TableRow
                            key={product.id}
                            className="border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="text-gray-500 text-sm">#{product.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="text-gray-900 text-sm font-medium">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 font-medium text-sm">
                              {Number(product.costPrice).toLocaleString('vi-VN')} ₫
                            </TableCell>
                            <TableCell className="text-green-600 font-medium text-sm">
                              {Number(product.sellingPrice).toLocaleString('vi-VN')} ₫
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm font-medium ${product.quantity <= 5 ? 'text-red-400' : 'text-gray-900'}`}>
                                {product.quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
                                {product.category?.name || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleTogglePublish(product)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                  product.published
                                    ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                                    : 'bg-gray-500/15 text-gray-500 hover:bg-gray-500/25'
                                }`}
                              >
                                {product.published
                                  ? <><Eye className="w-3 h-3" /> Hiển thị</>
                                  : <><EyeOff className="w-3 h-3" /> Ẩn</>
                                }
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditProduct(product)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(product)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* ─── CATEGORIES TAB ─── */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-900 font-medium">Danh sách danh mục</span>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-0">
                      {categories.length}
                    </Badge>
                  </div>
                  <Button
                    onClick={openAddCategory}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2 shadow-lg shadow-purple-500/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Thêm danh mục
                  </Button>
                </div>

                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Tag className="w-12 h-12 mb-3 opacity-30" />
                    <p>Chưa có danh mục nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {categories.map(cat => {
                      const productCount = products.filter(p => p.category?.id === cat.id).length
                      return (
                        <div
                          key={cat.id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Tag className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditCategory(cat)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setCatDeleteTarget(cat)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-gray-900 font-medium text-sm">{cat.name}</div>
                          <div className="text-gray-500 text-xs mt-1">{productCount} sản phẩm</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── ORDERS TAB ─── */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-900 font-medium">Danh sách đơn hàng</span>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-0">
                      {orders.length}
                    </Badge>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                    <p>Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-500 font-medium">Mã ĐH</TableHead>
                          <TableHead className="text-gray-500 font-medium">Khách hàng</TableHead>
                          <TableHead className="text-gray-500 font-medium">Tổng tiền</TableHead>
                          <TableHead className="text-gray-500 font-medium">Ngày đặt</TableHead>
                          <TableHead className="text-gray-500 font-medium">Trạng thái</TableHead>
                          <TableHead className="text-gray-500 font-medium text-right">Chi tiết</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
                          <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                            <TableCell className="text-gray-500 text-sm">#{order.id}</TableCell>
                            <TableCell>
                              <div className="text-gray-900 text-sm font-medium">{order.customerName}</div>
                              <div className="text-gray-500 text-xs">{order.phone} - {order.email}</div>
                            </TableCell>
                            <TableCell className="text-orange-400 font-medium text-sm">
                              {order.totalSellingAmount ? order.totalSellingAmount.toLocaleString('vi-VN') : 0} ₫
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20' :
                                order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/20' :
                                order.status === 'shipping' ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/20' :
                                order.status === 'completed' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/20' :
                                'bg-red-500/20 text-red-500 hover:bg-red-500/20'
                              }`}>
                                {order.status === 'pending' ? 'Chờ xử lý' :
                                 order.status === 'confirmed' ? 'Đã xác nhận' :
                                 order.status === 'shipping' ? 'Đang giao' :
                                 order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <button
                                onClick={() => { setCurrentOrder(order); setIsOrderDialogOpen(true); }}
                                className="p-2 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── PRODUCT Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg">
              {currentProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {currentProduct ? 'Cập nhật thông tin sản phẩm bên dưới' : 'Điền thông tin để thêm sản phẩm mới vào hệ thống'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm">Tên sản phẩm *</Label>
              <Input
                value={formState.name}
                onChange={e => setFormState(p => ({ ...p, name: e.target.value }))}
                placeholder="Nhập tên sản phẩm"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 text-sm">Giá gốc (₫) *</Label>
                <Input
                  type="number"
                  value={formState.costPrice}
                  onChange={e => setFormState(p => ({ ...p, costPrice: e.target.value }))}
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 text-sm">Giá bán (₫) *</Label>
                <Input
                  type="number"
                  value={formState.sellingPrice}
                  onChange={e => setFormState(p => ({ ...p, sellingPrice: e.target.value }))}
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 text-sm">Số lượng</Label>
                <Input
                  type="number"
                  value={formState.quantity}
                  onChange={e => setFormState(p => ({ ...p, quantity: e.target.value }))}
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm">Danh mục *</Label>
              <Select
                value={formState.categoryId || undefined}
                onValueChange={v => setFormState(p => ({ ...p, categoryId: v }))}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500/50">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {categories.map(cat => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                      className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm">URL ảnh</Label>
              <Input
                value={formState.image}
                onChange={e => setFormState(p => ({ ...p, image: e.target.value }))}
                placeholder="https://..."
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50"
              />
              {formState.image && (
                <img
                  src={formState.image}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200 mt-2"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm">Mô tả</Label>
              <Textarea
                value={formState.description}
                onChange={e => setFormState(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả ngắn về sản phẩm..."
                rows={3}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500/50 resize-none"
              />
            </div>

            {/* Publish toggle */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div>
                <div className="text-gray-900 text-sm font-medium">Hiển thị sản phẩm</div>
                <div className="text-gray-500 text-xs">Khách hàng sẽ thấy sản phẩm này</div>
              </div>
              <button
                type="button"
                onClick={() => setFormState(p => ({ ...p, published: !p.published }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formState.published ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formState.published ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitProduct}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 min-w-[100px]"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : currentProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CATEGORY Dialog ─── */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {currentCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {currentCategory ? 'Cập nhật tên danh mục' : 'Nhập tên danh mục mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-gray-700 text-sm">Tên danh mục *</Label>
            <Input
              value={catForm.name}
              onChange={e => setCatForm({ name: e.target.value })}
              placeholder="Ví dụ: Điện tử, Thời trang..."
              className="mt-1.5 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500/50"
              onKeyDown={e => e.key === 'Enter' && handleSubmitCategory()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCatDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitCategory}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : currentCategory ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE Product Confirm ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Bạn có chắc muốn xóa{' '}
              <span className="text-gray-900 font-medium">&quot;{deleteTarget?.name}&quot;</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-transparent">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-gray-900"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── DELETE Category Confirm ─── */}
      <AlertDialog open={!!catDeleteTarget} onOpenChange={open => !open && setCatDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Bạn có chắc muốn xóa danh mục{' '}
              <span className="text-gray-900 font-medium">&quot;{catDeleteTarget?.name}&quot;</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-transparent">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-gray-900"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── ORDER Dialog ─── */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg flex items-center justify-between">
              <span>Chi tiết đơn hàng #{currentOrder?.id}</span>
              <Badge className={`text-xs ${
                currentOrder?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20' :
                currentOrder?.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/20' :
                currentOrder?.status === 'shipping' ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/20' :
                currentOrder?.status === 'completed' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/20' :
                'bg-red-500/20 text-red-500 hover:bg-red-500/20'
              }`}>
                {currentOrder?.status === 'pending' ? 'Chờ xử lý' :
                 currentOrder?.status === 'confirmed' ? 'Đã xác nhận' :
                 currentOrder?.status === 'shipping' ? 'Đang giao' :
                 currentOrder?.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Đặt lúc {currentOrder ? new Date(currentOrder.createdAt).toLocaleString('vi-VN') : ''}
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" /> Thông tin người đặt
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Họ tên:</span>
                    <span className="text-gray-700">{currentOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Số điện thoại:</span>
                    <span className="text-gray-700">{currentOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email:</span>
                    <span className="text-gray-700">{currentOrder.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Địa chỉ:</span>
                    <span className="text-gray-700">{currentOrder.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400" /> Sản phẩm đã mua
                </h3>
                <div className="space-y-3">
                  {currentOrder.details?.map(detail => (
                    <div key={detail.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {detail.product.image ? (
                        <img src={detail.product.image} alt={detail.product.name} className="w-12 h-12 object-cover rounded-md" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center"><Package className="w-4 h-4 text-gray-500"/></div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{detail.product.name}</div>
                        <div className="text-xs text-gray-500">x{detail.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-orange-400">
                        {(detail.sellingPrice * detail.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-orange-400">{currentOrder.totalSellingAmount?.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-green-400" /> Cập nhật trạng thái
                </h3>
                <div className="flex gap-2">
                  <Select
                    value={currentOrder.status}
                    onValueChange={(v) => handleUpdateOrderStatus(currentOrder.id, v)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 flex-1">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="pending" className="text-yellow-600 focus:bg-gray-100 focus:text-yellow-700">Chờ xử lý</SelectItem>
                      <SelectItem value="confirmed" className="text-blue-600 focus:bg-gray-100 focus:text-blue-700">Đã xác nhận</SelectItem>
                      <SelectItem value="shipping" className="text-purple-600 focus:bg-gray-100 focus:text-purple-700">Đang giao</SelectItem>
                      <SelectItem value="completed" className="text-green-600 focus:bg-gray-100 focus:text-green-700">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled" className="text-red-600 focus:bg-gray-100 focus:text-red-700">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AiChatBox />
    </div>
  )
}
