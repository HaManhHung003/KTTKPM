import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace('/api', '/ws')
  : 'http://localhost:8080/ws';

let stompClient: Client | null = null;
let currentSubscriptions: Map<string, StompSubscription> = new Map();
let pendingSubscriptions: Map<string, (msg: any) => void> = new Map();
let isConnecting = false;

export const connectChat = (
  topicIdentifier: number | string,
  onMessageReceived: (msg: any) => void,
  onConnected?: () => void,
  onError?: (err: any) => void
) => {
  const topicString = typeof topicIdentifier === 'number' 
    ? `/topic/chat.${topicIdentifier}` 
    : `/topic/${topicIdentifier}`;

  
  if (stompClient?.connected) {
    if (currentSubscriptions.has(topicString)) {
      currentSubscriptions.get(topicString)?.unsubscribe();
    }
    const sub = stompClient.subscribe(topicString, (message) => {
      if (message.body) {
        onMessageReceived(JSON.parse(message.body));
      }
    });
    currentSubscriptions.set(topicString, sub);
    if (onConnected) onConnected();
    return stompClient;
  }

  
  pendingSubscriptions.set(topicString, onMessageReceived);

  
  if (isConnecting || stompClient) {
    return stompClient;
  }

  
  isConnecting = true;
  const token = Cookies.get('accessToken');

  stompClient = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),
    connectHeaders: {
      Authorization: `Bearer ${token || ''}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = (frame) => {
    console.log('Connected STOMP');
    isConnecting = false;
    
    
    pendingSubscriptions.forEach((callback, topic) => {
      if (currentSubscriptions.has(topic)) {
        currentSubscriptions.get(topic)?.unsubscribe();
      }
      const sub = stompClient!.subscribe(topic, (message) => {
        if (message.body) {
          callback(JSON.parse(message.body));
        }
      });
      currentSubscriptions.set(topic, sub);
    });
    pendingSubscriptions.clear();

    if (onConnected) onConnected();
  };

  stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
    isConnecting = false;
    if (onError) onError(frame);
  };

  stompClient.onWebSocketClose = () => {
    isConnecting = false;
  };

  stompClient.activate();

  return stompClient;
};

export const unsubscribeTopic = (topicIdentifier: number | string) => {
  const topicString = typeof topicIdentifier === 'number' 
    ? `/topic/chat.${topicIdentifier}` 
    : `/topic/${topicIdentifier}`;
    
  if (currentSubscriptions.has(topicString)) {
    currentSubscriptions.get(topicString)?.unsubscribe();
    currentSubscriptions.delete(topicString);
  }
  if (pendingSubscriptions.has(topicString)) {
    pendingSubscriptions.delete(topicString);
  }
};

export const disconnectChat = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    isConnecting = false;
    currentSubscriptions.clear();
    pendingSubscriptions.clear();
  }
};

export const sendChatMessage = (userId: number, message: string) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ userId, message }),
    });
    return true;
  }
  return false;
};
