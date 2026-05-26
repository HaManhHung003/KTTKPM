'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import ChatPanel from '../../../components/ChatPanel'
import api from '../../../lib/api'
import type { User } from '../../../lib/types'

export default function AdminChatPage() {
  const [ready, setReady] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get<User>('/auth/me')
        const isAdmin =
          res.data.role === 'Admin' ||
          res.data.authorities?.some((authority) => authority.authority === 'ROLE_ADMIN')

        if (!isAdmin) {
          setBlocked(true)
        }
      } catch {
        setBlocked(true)
      } finally {
        setReady(true)
      }
    }

    checkAdmin()
  }, [])

  useEffect(() => {
    if (ready && blocked) {
      router.replace('/login?from=/admin/chat')
    }
  }, [ready, blocked, router])

  if (!ready || blocked) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ChatPanel mode="admin" />
      </main>
      <Footer />
    </div>
  )
}
