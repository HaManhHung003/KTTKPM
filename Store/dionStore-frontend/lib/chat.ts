import Cookies from 'js-cookie'
import api from '@/lib/api'
import type { ChatMessage, ChatRoom, ChatSocketEvent } from '@/lib/types'

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL ?? 'ws://localhost:8080/ws/chat'

function readAccessToken() {
  return Cookies.get('accessToken')
}

function toWsUrl(roomId: string) {
  const token = readAccessToken()
  const url = new URL(WS_BASE_URL)
  url.searchParams.set('roomId', roomId)
  if (token) {
    url.searchParams.set('token', token)
  }
  return url.toString()
}

export async function getOrCreateCustomerSupportRoom() {
  const res = await api.post<ChatRoom>('/chat/rooms/customer-support')
  return res.data
}

export async function getAdminRooms() {
  const res = await api.get<ChatRoom[]>('/chat/rooms')
  return res.data
}

export async function getRoomMessages(roomId: string) {
  const res = await api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
  return res.data
}

export async function sendMessage(roomId: string, content: string) {
  const res = await api.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, { content })
  return res.data
}

export function connectRoom(roomId: string, handlers: {
  onOpen?: () => void
  onMessage?: (message: ChatMessage) => void
  onError?: (errorMessage: string) => void
  onClose?: () => void
}) {
  const socket = new WebSocket(toWsUrl(roomId))

  socket.onopen = () => {
    handlers.onOpen?.()
    const joinEvent: ChatSocketEvent = {
      type: 'join',
      payload: { roomId },
    }
    socket.send(JSON.stringify(joinEvent))
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ChatSocketEvent | ChatMessage

      // Support both raw message payload and wrapped socket event formats.
      if ('type' in data) {
        if (data.type === 'message' && data.payload) {
          handlers.onMessage?.(data.payload as ChatMessage)
        }
        if (data.type === 'error') {
          handlers.onError?.('Realtime connection reported an error.')
        }
        return
      }

      handlers.onMessage?.(data)
    } catch {
      handlers.onError?.('Cannot parse realtime message payload.')
    }
  }

  socket.onerror = () => {
    handlers.onError?.('Realtime socket failed to connect.')
  }

  socket.onclose = () => {
    handlers.onClose?.()
  }

  const sendRealtimeMessage = (content: string) => {
    if (socket.readyState !== WebSocket.OPEN) {
      return false
    }

    const event: ChatSocketEvent = {
      type: 'message',
      payload: { roomId, content },
    }
    socket.send(JSON.stringify(event))
    return true
  }

  return {
    socket,
    sendRealtimeMessage,
    disconnect: () => {
      socket.close()
    },
  }
}
