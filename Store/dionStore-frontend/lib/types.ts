export interface User {
  id: string;
  email: string;
  role?: 'Admin' | 'Customer' | 'admin' | 'customer';
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
  senderRole: string; 
  isRead: boolean;
  createdAt: string;
}

export interface ChatSocketEvent {
  type: 'join' | 'message' | 'typing' | 'presence' | 'error';
  payload?: unknown;
}
