'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

type SellerStat = {
  auction_id: number
  title: string
  view_count: number
  bid_count: number
  question_count: number
  current_bid: number
  end_time: string
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<SellerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/seller-stats')
        if (!response.ok) {
          throw new Error('Failed to fetch seller stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Sprzedawcy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Wyświetlenia Aukcji</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="view_count" fill="#8884d8" name="Wyświetlenia" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liczba Ofert</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bid_count" fill="#82ca9d" name="Oferty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktywne Aukcje</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tytuł</TableHead>
                <TableHead>Aktualna Cena</TableHead>
                <TableHead>Wyświetlenia</TableHead>
                <TableHead>Oferty</TableHead>
                <TableHead>Pytania</TableHead>
                <TableHead>Koniec</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((auction) => (
                <TableRow key={auction.auction_id}>
                  <TableCell>{auction.title}</TableCell>
                  <TableCell>{new Intl.NumberFormat('de-CH').format(auction.current_bid)} CHF</TableCell>
                  <TableCell>{auction.view_count}</TableCell>
                  <TableCell>{auction.bid_count}</TableCell>
                  <TableCell>{auction.question_count}</TableCell>
                  <TableCell>
                    <Badge variant={new Date(auction.end_time) < new Date() ? 'destructive' : 'default'}>
                      {new Date(auction.end_time).toLocaleString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}