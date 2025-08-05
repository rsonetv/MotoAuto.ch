"use client"

import { useEffect, useState } from "react"
import { Auction } from "@/lib/schemas/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { io, Socket } from "socket.io-client"

interface LiveAuctionCardProps {
  auction: Auction
}

// Mock bid type for now
type Bid = {
  amount: number;
  bidder: string;
  timestamp: string;
}

export function LiveAuctionCard({ auction: initialAuction }: LiveAuctionCardProps) {
  const [auction, setAuction] = useState<Auction>(initialAuction)
  const [timeLeft, setTimeLeft] = useState("")
  const [bids, setBids] = useState<Bid[]>([])
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      newSocket.emit('join_auction', auction.id);
    });

    newSocket.on('time_update', (data) => {
      if (data.auctionId === auction.id) {
        setTimeLeft(data.timeLeft);
      }
    });

    newSocket.on('new_bid', (data) => {
      if (data.auctionId === auction.id) {
        setAuction(prev => ({ ...prev, current_bid: data.bid.amount }));
        setBids(prev => [data.bid, ...prev].slice(0, 5));
      }
    });
    
    return () => {
      newSocket.disconnect();
    }
  }, [auction.id]);


  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const endTime = new Date(auction.end_time).getTime()
      const distance = endTime - now

      if (distance < 0) {
        setTimeLeft("Auction Finished")
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [auction.end_time])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{auction.title}</span>
          <Badge variant={auction.status === 'live' ? 'destructive' : 'secondary'}>
            {auction.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Time Remaining</p>
            <p className="text-2xl font-bold">{timeLeft}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Bid</p>
            <p className="text-2xl font-bold">
              {auction.current_bid ? `CHF ${auction.current_bid.toLocaleString()}` : "No Bids"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recent Bids</h4>
            <ul className="space-y-1 text-sm">
              {bids.map((bid, index) => (
                <li key={index}>
                  CHF {bid.amount.toLocaleString()} by {bid.bidder}
                </li>
              ))}
              {bids.length === 0 && <li>No recent bids.</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}