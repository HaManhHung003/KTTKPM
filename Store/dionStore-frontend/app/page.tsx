'use client'

import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import CategorySection from '@/components/CategorySection'
import FeaturedProducts from '@/components/FeaturedProducts'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  )
}
