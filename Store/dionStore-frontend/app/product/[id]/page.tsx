'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Star, Check, ArrowLeft, Plus, Minus } from 'lucide-react'
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
  category?: { id: number, name: string }
  image: string
  description?: string
  isPublished: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await api.get<Product>(`/products/${id}`)
        setProduct(response.data)
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', err)
        setError('Không thể tải chi tiết sản phẩm hoặc sản phẩm không tồn tại.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.sellingPrice,
      originalPrice: product.originalPrice ?? product.sellingPrice,
      image: product.image,
    }, quantity)

    setAdded(true)
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-foreground">Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-500">{error || 'Sản phẩm không tồn tại'}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          ← Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/10 rounded-2xl border border-border p-8 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
          {product.discount && product.discount > 0 && (
            <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              Giảm {product.discount}%
            </div>
          )}
        </div>

        {}
        <div className="flex flex-col justify-center">
          {product.category && (
            <Link href={`/category/${product.category.id}`} className="text-primary font-medium hover:underline mb-2 inline-block">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>

          {}
          {(product.rating !== undefined && product.reviews !== undefined) ? (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>
          ) : (
            <div className="mb-6"></div>
          )}

          {}
          <div className="mb-8 flex items-end gap-4">
            <div className="text-4xl font-bold text-primary">
              {product.sellingPrice.toLocaleString('vi-VN')} ₫
            </div>
            {product.originalPrice && product.originalPrice > product.sellingPrice && (
              <div className="text-lg text-muted-foreground line-through mb-1">
                {product.originalPrice.toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          {}
          {product.description && (
            <div className="prose prose-sm sm:prose-base dark:prose-invert text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>
          )}

          <hr className="border-border mb-8" />

          {}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {}
            <div className="flex items-center border border-border rounded-lg h-12">
              <button 
                onClick={decreaseQuantity}
                className="w-12 h-full flex items-center justify-center text-foreground hover:bg-muted/50 rounded-l-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 h-full flex items-center justify-center font-medium text-foreground border-x border-border">
                {quantity}
              </div>
              <button 
                onClick={increaseQuantity}
                className="w-12 h-full flex items-center justify-center text-foreground hover:bg-muted/50 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className={`flex-1 h-12 text-base font-semibold gap-2 transition-all ${
                added ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
              } text-white`}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  Đã thêm vào giỏ
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ hàng
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
