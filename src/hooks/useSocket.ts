import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import authConfig from 'src/configs/auth'

export interface UseSocketOptions {
  token?: string
  onNewMessage?: (data: any) => void
  onMessageSent?: (data: any) => void
  onNotification?: (data: any) => void
  onConversationUpdated?: (data: any) => void
  onErpSyncProgress?: (data: any) => void
}

let globalSocket: Socket | null = null
let currentSocketToken: string | null = null

export function disconnectGlobalSocket() {
  if (globalSocket) {
    globalSocket.removeAllListeners()
    globalSocket.disconnect()
    globalSocket = null
    currentSocketToken = null
  }
}

export function useSocket(options: UseSocketOptions = {}) {
  const { token, onNewMessage, onMessageSent, onNotification, onConversationUpdated, onErpSyncProgress } = options
  const [isConnected, setIsConnected] = useState<boolean>(() => Boolean(globalSocket?.connected))

  const onNewMessageRef = useRef(onNewMessage)
  const onMessageSentRef = useRef(onMessageSent)
  const onNotificationRef = useRef(onNotification)
  const onConversationUpdatedRef = useRef(onConversationUpdated)
  const onErpSyncProgressRef = useRef(onErpSyncProgress)

  useEffect(() => {
    onNewMessageRef.current = onNewMessage
    onMessageSentRef.current = onMessageSent
    onNotificationRef.current = onNotification
    onConversationUpdatedRef.current = onConversationUpdated
    onErpSyncProgressRef.current = onErpSyncProgress
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl) return

    const activeToken = token || window.localStorage.getItem(authConfig.storageTokenKeyName)

    if (!activeToken) {
      if (globalSocket) {
        disconnectGlobalSocket()
        setIsConnected(false)
      }

      return
    }

    if (globalSocket && currentSocketToken && currentSocketToken !== activeToken) {
      disconnectGlobalSocket()
    }

    if (!globalSocket) {
      currentSocketToken = activeToken

      globalSocket = io(wsUrl, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        auth: {
          token: activeToken
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 10000
      })

      globalSocket.on('connect', () => {
        setIsConnected(true)
      })

      globalSocket.on('connected', () => {
        setIsConnected(true)
      })

      globalSocket.on('disconnect', reason => {
        setIsConnected(false)
        if (reason === 'io server disconnect') {
          globalSocket?.disconnect()
        }
      })

      globalSocket.on('auth_error', () => {
        setIsConnected(false)
        disconnectGlobalSocket()
      })

      globalSocket.on('connect_error', () => {
        setIsConnected(false)
      })

      globalSocket.on('chat:new_message', data => onNewMessageRef.current?.(data))
      globalSocket.on('chat:message_sent', data => onMessageSentRef.current?.(data))
      globalSocket.on('notification:new', data => onNotificationRef.current?.(data))
      globalSocket.on('chat:conversation_updated', data => onConversationUpdatedRef.current?.(data))
      globalSocket.on('erp:sync_progress', data => onErpSyncProgressRef.current?.(data))
    } else {
      setIsConnected(Boolean(globalSocket.connected))
    }

    if (globalSocket?.connected) {
      setIsConnected(true)
    }
  }, [token])

  return {
    socket: globalSocket,
    isConnected
  }
}
