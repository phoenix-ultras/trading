import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

export function connectMarketSocket() {
  return io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    withCredentials: true
  });
}
