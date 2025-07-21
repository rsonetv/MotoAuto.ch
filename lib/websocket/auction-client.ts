"use client"

import { useCallback } from "react"

import { useEffect } from "react"

import { useState } from "react"

interface AuctionUpdate {
  type: "bid" | "time_update" | "auction_end" | "user_joined" | "user_left"
  data: any
}

interface AuctionClientOptions {
  auctionId: string
  onUpdate: (update: AuctionUpdate) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export class AuctionClient {
  private ws: WebSocket | null = null
  private options: AuctionClientOptions
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(options: AuctionClientOptions) {
    this.options = options
  }

  connect() {
    try {
      // In a real implementation, you would connect to your WebSocket server
      // For now, we'll simulate the connection
      this.simulateConnection()
    } catch (error) {
      this.options.onError?.(error as Error)
    }
  }

  private simulateConnection() {
    // Simulate WebSocket connection
    console.log(`Connecting to auction ${this.options.auctionId}`)

    this.options.onConnect?.()

    // Simulate periodic updates
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        // 20% chance of update
        const updateTypes: AuctionUpdate["type"][] = ["bid", "time_update", "user_joined"]
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]

        let data: any = {}

        switch (randomType) {
          case "bid":
            data = {
              bidId: Date.now().toString(),
              amount: Math.floor(Math.random() * 10000) + 50000,
              bidder: `User${Math.floor(Math.random() * 100)}`,
              timestamp: new Date().toISOString(),
            }
            break
          case "time_update":
            data = {
              timeRemaining: Math.max(0, Math.floor(Math.random() * 3600)),
            }
            break
          case "user_joined":
            data = {
              userId: `user_${Date.now()}`,
              username: `Bidder${Math.floor(Math.random() * 100)}`,
            }
            break
        }

        this.options.onUpdate({
          type: randomType,
          data,
        })
      }
    }, 2000)

    // Store interval for cleanup
    ;(this as any).updateInterval = interval
  }

  sendBid(amount: number) {
    if (!this.ws) {
      console.log("Simulating bid:", amount)
      // In a real implementation, you would send the bid through WebSocket
      this.options.onUpdate({
        type: "bid",
        data: {
          bidId: Date.now().toString(),
          amount,
          bidder: "You",
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    this.ws.send(
      JSON.stringify({
        type: "place_bid",
        auctionId: this.options.auctionId,
        amount,
      }),
    )
  }

  disconnect() {
    if ((this as any).updateInterval) {
      clearInterval((this as any).updateInterval)
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.options.onDisconnect?.()
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
}

// Hook for using auction WebSocket
export function useAuctionSocket(auctionId: string) {
  const [client, setClient] = useState<AuctionClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [updates, setUpdates] = useState<AuctionUpdate[]>([])

  useEffect(() => {
    const auctionClient = new AuctionClient({
      auctionId,
      onUpdate: (update) => {
        setUpdates((prev) => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
      },
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: (error) => console.error("Auction WebSocket error:", error),
    })

    auctionClient.connect()
    setClient(auctionClient)

    return () => {
      auctionClient.disconnect()
    }
  }, [auctionId])

  const sendBid = useCallback(
    (amount: number) => {
      client?.sendBid(amount)
    },
    [client],
  )

  return {
    isConnected,
    updates,
    sendBid,
  }
}
