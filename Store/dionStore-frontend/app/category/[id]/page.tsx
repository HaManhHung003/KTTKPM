'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import api from '@/lib/api'

interface Product {
  id: number
  name: string
  costPrice: number
  sellingPrice: number
  originalPrice?: number
  discount?: number
  rating?: number
  reviews?: number
  category?: { name: string }
  image: string
  isPublished: boolean
}

interface Category {
  id: number
  name: string
  description?: string
}

export default function CategoryProductsPage() {
  const params = useParams()
  const id = params.id as string

  const { addItem } = useCart()
  const [addedItems, setAddedItems] = useState<string[]>([])
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch category details
        const catRes = await api.get<Category>(`/categories/${id}`)
        setCategory(catRes.data)

        // Fetch products for this category
        const prodRes = await api.get<Product[]>(`/products/category/${id}`)
        setProducts(prodRes.data)
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu:', err)
        setError('Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.sellingPrice,
      originalPrice: product.originalPrice,
      image: product.image,
    })

    setAddedItems([...addedItems, product.id.toString()])
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((itemId) => itemId !== product.id.toString()))
    }, 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-foreground">Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-500">{error}</p>
        <Link href="/categories" className="text-primary hover:underline mt-4 inline-block">
          ← Quay lại danh mục
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/categories" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tất cả danh mục
      </Link>
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {category?.name || 'Danh mục'}
        </h1>
        {category?.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border">
          <p className="text-lg text-muted-foreground">Chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-muted/30 p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg z-10">
                      -{product.discount}%
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4 flex flex-col justify-between h-[200px]">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{category?.name || product.category?.name || 'Danh mục'}</p>
                  <Link href={`/product/${product.id}`} className="hover:underline">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm">
                      {product.name}
                    </h3>
                  </Link>

                  {product.rating !== undefined && product.reviews !== undefined && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(product.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-lg font-bold text-primary">
                      {product.sellingPrice.toLocaleString('vi-VN')} ₫
                    </div>
                    {product.originalPrice && product.originalPrice > product.sellingPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString('vi-VN')} ₫
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full gap-2 transition-all ${addedItems.includes(product.id.toString())
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-primary hover:bg-primary/90'
                    } text-white`}
                >
                  {addedItems.includes(product.id.toString()) ? (
                    <>
                      <Check className="h-4 w-4" />
                      Đã thêm
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Thêm vào giỏ
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
