'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatPanel from '@/components/ChatPanel'

export default function CustomerChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ChatPanel mode="customer" />
      </main>
      <Footer />
    </div>
  )
}
