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

export interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  senderRole: string; // 'admin' or 'customer'
  isRead: boolean;
  createdAt: string;
}

export interface ChatSocketEvent {
  type: 'join' | 'message' | 'typing' | 'presence' | 'error';
  payload?: unknown;
}
