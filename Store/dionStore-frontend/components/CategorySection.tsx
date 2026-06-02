'use client'

import { useState, useEffect } from 'react'
import { Laptop, Sparkles, Shirt, Book, Package } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import api from '@/lib/api'

interface Category {
  id: number
  name: string
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get<Category[]>('/categories')
        setCategories(data.slice(0, 6))
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-pink-100 text-pink-600',
    'bg-purple-100 text-purple-600',
    'bg-green-100 text-green-600',
    'bg-orange-100 text-orange-600',
    'bg-yellow-100 text-yellow-700',
  ]
  const icons = [Laptop, Sparkles, Shirt, Book, Package, Sparkles]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Danh mục sản phẩm</h2>
        <Link href="/categories" className="text-primary hover:underline">
          Xem tất cả →
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((category, index) => {
          const Icon = icons[index % icons.length]
          const colorClass = colors[index % colors.length]
          return (
            <Link key={category.id} href={`/category/${category.id}`}>
              <div className={`flex flex-col items-center justify-center p-6 h-full rounded-2xl ${colorClass} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}>
                <Icon className="h-10 w-10 mb-3" />
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
