"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface WebSocketOptions {
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const {
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onConnect,
    onDisconnect,
    onError
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('')
  const [reconnectCount, setReconnectCount] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventListenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setReconnectCount(0)
        setLastHeartbeat(new Date().toISOString())
        onConnect?.()

        // Start heartbeat
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current)
        }
        heartbeatTimeoutRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'heartbeat' }))
            setLastHeartbeat(new Date().toISOString())
          }
        }, heartbeatInterval)
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()

        // Clear heartbeat
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current)
        }

        // Attempt reconnection
        if (reconnectCount < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current.onerror = (error) => {
        onError?.(error)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle special messages
          if (message.type === 'participants_count') {
            setParticipants(message.data.count)
          }

          // Trigger event listeners
          const listeners = eventListenersRef.current.get(message.type)
          if (listeners) {
            listeners.forEach(callback => callback(message.data))
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
    }
  }, [url, reconnectAttempts, reconnectInterval, heartbeatInterval, reconnectCount, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }, [])

  const send = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }))
    }
  }, [])

  const on = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!eventListenersRef.current.has(eventType)) {
      eventListenersRef.current.set(eventType, new Set())
    }
    eventListenersRef.current.get(eventType)!.add(callback)
  }, [])

  const off = useCallback((eventType: string, callback: (data: any) => void) => {
    const listeners = eventListenersRef.current.get(eventType)
    if (listeners) {
      listeners.delete(callback)
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    participants,
    lastHeartbeat,
    reconnectCount,
    connect,
    disconnect,
    send,
    on,
    off
  }
}