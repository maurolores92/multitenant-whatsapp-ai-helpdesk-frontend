'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseSocketOptions {
  token?: string;
  onNewMessage?: (data: any) => void;
  onMessageSent?: (data: any) => void;
  onNotification?: (data: any) => void;
  onConversationUpdated?: (data: any) => void;
}

// Socket singleton a nivel de módulo: vive durante toda la sesión autenticada.
// Esto evita al 100% que los ciclos de renderizado de React o el Hot Module Reloading
// abran y cierren conexiones en bucle (el origen de "WebSocket is closed before the connection is established").
let globalSocket: Socket | null = null;
let currentSocketToken: string | null = null;

/**
 * Cierra la conexión socket global (llamado explícitamente en Logout)
 */
export function disconnectGlobalSocket() {
  if (globalSocket) {
    globalSocket.removeAllListeners();
    globalSocket.disconnect();
    globalSocket = null;
    currentSocketToken = null;
  }
}

export function useSocket(options: UseSocketOptions = {}) {
  const { token, onNewMessage, onMessageSent, onNotification, onConversationUpdated } = options;
  const [isConnected, setIsConnected] = useState<boolean>(() => Boolean(globalSocket?.connected));

  // Refs para asegurar que los callbacks más recientes siempre se ejecuten
  // sin necesidad de re-suscribir eventos ni reiniciar la conexión.
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageSentRef = useRef(onMessageSent);
  const onNotificationRef = useRef(onNotification);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageSentRef.current = onMessageSent;
    onNotificationRef.current = onNotification;
    onConversationUpdatedRef.current = onConversationUpdated;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;

    const activeToken = token || localStorage.getItem('auth_token');

    // Si el usuario no tiene token (no ha iniciado sesión), no abrir socket
    if (!activeToken) {
      if (globalSocket) {
        disconnectGlobalSocket();
        setIsConnected(false);
      }
      return;
    }

    // Si el token cambió (por ejemplo, cambio de usuario), reconectar limpiamente
    if (globalSocket && currentSocketToken && currentSocketToken !== activeToken) {
      disconnectGlobalSocket();
    }

    // Si ya existe la instancia y está conectada o conectando con el mismo token, no duplicar
    if (!globalSocket) {
      currentSocketToken = activeToken;

      // Usar ['polling', 'websocket'] (estándar oficial de Socket.IO):
      // Primero realiza el handshake HTTP 200 en ~10ms y luego eleva a WebSocket de forma segura y transparente,
      // evitando fallos de conexión prematura o bloqueos de handshake en el navegador.
      globalSocket = io(wsUrl, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        auth: {
          token: activeToken,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 10000,
      });

      globalSocket.on('connect', () => {
        setIsConnected(true);
      });

      globalSocket.on('connected', () => {
        setIsConnected(true);
      });

      globalSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        // Si el servidor rechazó intencionalmente la conexión, evitar reintentos en bucle
        if (reason === 'io server disconnect') {
          globalSocket?.disconnect();
        }
      });

      globalSocket.on('auth_error', () => {
        setIsConnected(false);
        disconnectGlobalSocket();
      });

      globalSocket.on('connect_error', () => {
        setIsConnected(false);
      });

      // Delegar eventos a los refs activos
      globalSocket.on('chat:new_message', (data) => onNewMessageRef.current?.(data));
      globalSocket.on('chat:message_sent', (data) => onMessageSentRef.current?.(data));
      globalSocket.on('notification:new', (data) => onNotificationRef.current?.(data));
      globalSocket.on('chat:conversation_updated', (data) => onConversationUpdatedRef.current?.(data));
    } else {
      setIsConnected(Boolean(globalSocket.connected));
    }

    // Sincronizar estado si ya está conectado
    if (globalSocket?.connected) {
      setIsConnected(true);
    }

    // IMPORTANTE: NO desconectar en el return del useEffect.
    // La conexión pertenece a la sesión de la aplicación y debe persistir entre cambios de página.
  }, [token]);

  return {
    socket: globalSocket,
    isConnected,
  };
}
