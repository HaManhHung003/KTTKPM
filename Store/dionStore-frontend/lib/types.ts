export interface User {
  id: string;
  email: string;
  role?: 'Admin' | 'Customer';
  authorities?: Array<{ authority: string }>;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChatRoom {
  id: string;
  customerEmail: string;
  adminEmail?: string;
  status?: 'open' | 'closed';
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderEmail: string;
  senderRole: 'Admin' | 'Customer';
  content: string;
  createdAt: string;
}

export interface ChatSocketEvent {
  type: 'join' | 'message' | 'typing' | 'presence' | 'error';
  payload?: unknown;
}
