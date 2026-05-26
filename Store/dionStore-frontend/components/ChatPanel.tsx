'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Send, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import api from '@/lib/api'
import type { ChatMessage, ChatRoom, User } from '@/lib/types'
import {
  connectRoom,
  getAdminRooms,
  getOrCreateCustomerSupportRoom,
  getRoomMessages,
  sendMessage,
} from '@/lib/chat'

interface ChatPanelProps {
  mode: 'customer' | 'admin'
}

export default function ChatPanel({ mode }: ChatPanelProps) {
  const [me, setMe] = useState<User | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const disconnectRef = useRef<null | (() => void)>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) ?? null,
    [rooms, activeRoomId],
  )

  useEffect(() => {
    const boot = async () => {
      try {
        const meRes = await api.get<User>('/auth/me')
        setMe(meRes.data)

        if (mode === 'admin') {
          const roomList = await getAdminRooms()
          setRooms(roomList)
          if (roomList.length > 0) {
            setActiveRoomId(roomList[0].id)
          }
        } else {
          const room = await getOrCreateCustomerSupportRoom()
          setRooms([room])
          setActiveRoomId(room.id)
        }
      } catch (err) {
        setError('Không tải được dữ liệu chat. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    boot()
  }, [mode])

  useEffect(() => {
    if (!activeRoomId) {
      return
    }

    let cancelled = false
    const loadMessages = async () => {
      try {
        const initialMessages = await getRoomMessages(activeRoomId)
        if (!cancelled) {
          setMessages(initialMessages)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Không tải được lịch sử hội thoại.')
        }
      }
    }

    loadMessages()

    const conn = connectRoom(activeRoomId, {
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onError: (message) => setError(message),
      onMessage: (incoming) => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === incoming.id)) {
            return prev
          }
          return [...prev, incoming]
        })
      },
    })

    disconnectRef.current = conn.disconnect

    return () => {
      cancelled = true
      disconnectRef.current?.()
      disconnectRef.current = null
      setConnected(false)
    }
  }, [activeRoomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content || !activeRoomId) {
      return
    }

    setSending(true)
    setError('')

    try {
      const saved = await sendMessage(activeRoomId, content)
      setMessages((prev) => (prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]))
      setDraft('')
    } catch (err) {
      setError('Không gửi được tin nhắn. Vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {mode === 'admin' && (
        <Card className="p-3">
          <h2 className="font-semibold mb-3">Danh sách hội thoại</h2>
          <div className="space-y-2 max-h-[65vh] overflow-auto">
            {rooms.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có hội thoại nào.</p>
            )}
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                  activeRoomId === room.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <p className="text-sm font-medium">{room.customerEmail}</p>
                <p className="text-xs text-muted-foreground">{room.status ?? 'open'}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 flex flex-col h-[70vh]">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h1 className="text-lg font-semibold">
              {mode === 'admin' ? 'Admin Support Chat' : 'Chat với quản trị viên'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeRoom?.customerEmail ?? me?.email ?? 'Realtime 1:1'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Realtime connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600">Connecting...</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có tin nhắn, hãy bắt đầu hội thoại.</p>
          )}

          {messages.map((msg) => {
            const mine = me?.email && msg.senderEmail === me.email
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-[11px] opacity-75 mb-1">
                    {msg.senderRole} · {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-xs text-red-500 pb-2">{error}</p>}

        <form onSubmit={handleSend} className="pt-3 border-t border-border flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={mode === 'admin' ? 'Nhập phản hồi cho khách hàng...' : 'Nhập tin nhắn cho admin...'}
            disabled={!activeRoomId || sending}
          />
          <Button type="submit" disabled={!activeRoomId || sending || !draft.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </Card>
    </div>
  )
}
