'use client'

import { useState, useEffect } from 'react'
import { Laptop, Sparkles, Shirt, Book, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import api from '@/lib/api'

interface Category {
  id: number
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get<Category[]>('/categories')
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-pink-100 text-pink-600',
    'bg-purple-100 text-purple-600',
    'bg-green-100 text-green-600',
    'bg-yellow-100 text-yellow-600',
    'bg-red-100 text-red-600',
    'bg-indigo-100 text-indigo-600',
    'bg-teal-100 text-teal-600',
  ]
  const icons = [Laptop, Sparkles, Shirt, Book, Package]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-foreground">Đang tải danh mục...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Trang chủ
      </Link>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Tất cả danh mục</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Khám phá tất cả các danh mục sản phẩm của chúng tôi. Tại đây, bạn sẽ dễ dàng tìm thấy những sản phẩm ưng ý nhất.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length]
            const colorClass = colors[index % colors.length]
            return (
              <Link key={category.id} href={`/category/${category.id}`}>
                <div className={`flex flex-col items-center justify-center p-6 h-full rounded-2xl ${colorClass} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer text-center`}>
                  <Icon className="h-10 w-10 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm opacity-80 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
