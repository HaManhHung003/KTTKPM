'use client'

import { useState, useEffect } from 'react' 
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import api from '@/lib/api'


interface Product {
  id: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  originalPrice?: number; 
  discount?: number; 
  rating?: number; 
  reviews?: number; 
  category?: { name: string }; 
  image: string;
  isPublished: boolean; 
}

export default function FeaturedProducts() {
  const { addItem } = useCart()
  const [addedItems, setAddedItems] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([]) 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products'); 
        const data: Product[] = response.data;
        setProducts(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); 

  const handleAddToCart = (product: Product) => { 
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.sellingPrice,
      originalPrice: product.originalPrice ?? product.sellingPrice,
      image: product.image,
    })

    setAddedItems([...addedItems, product.id.toString()])
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((id) => id !== product.id.toString()))
    }, 2000)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-foreground">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-500">Lỗi khi tải sản phẩm: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Sản phẩm nổi bật</h2>
        <Link href="/products" className="text-primary hover:underline">
          Xem tất cả →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Chưa có sản phẩm nào được hiển thị.</p>
          <p className="text-sm text-muted-foreground">Vui lòng liên hệ quản trị viên để thêm sản phẩm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
              {}
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-muted/30 p-8">
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

              {}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-2">{product.category?.name || 'Unknown Category'}</p> {}
                <Link href={`/product/${product.id}`} className="hover:underline">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm">
                    {product.name}
                  </h3>
                </Link>

                {}
                {product.rating !== undefined && product.reviews !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
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

                {}
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

                {}
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
