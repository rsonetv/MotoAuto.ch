'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { TrendingUp, ExternalLink } from 'lucide-react'

type MarketData = {
  average_market_price: number
  price_history: { date: string; price: number }[]
  similar_vehicles: { id: number; title: string; final_price: number }[]
}

interface MarketDataContextProps {
  marketData: MarketData
  currentBid: number
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function MarketDataContext({
  marketData,
  currentBid,
}: MarketDataContextProps) {
  const { average_market_price, price_history, similar_vehicles } = marketData

  const priceDifferencePercentage =
    average_market_price > 0
      ? Math.round(((currentBid - average_market_price) / average_market_price) * 100)
      : 0

  const assistantMessage = () => {
    if (priceDifferencePercentage === 0) {
      return 'Aktualna cena jest równa średniej rynkowej.'
    } else if (priceDifferencePercentage < 0) {
      return `Ta cena jest o ${-priceDifferencePercentage}% niższa od średniej rynkowej.`
    } else {
      return `Ta cena jest o ${priceDifferencePercentage}% wyższa od średniej rynkowej.`
    }
  }

  const formattedPriceHistory = price_history.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary" />
          Analiza Rynkowa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asystent Licytacji */}
        <Alert variant={priceDifferencePercentage < 0 ? 'success' : 'destructive'}>
          <AlertDescription>{assistantMessage()}</AlertDescription>
        </Alert>

        {/* Wizualizacja Wartości - Wykres */}
        <div>
          <h4 className="font-semibold mb-2">Historia Cen Modelu</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedPriceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('de-CH', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value as number)
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'Cena']}/>
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                name="Średnia cena"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wizualizacja Wartości - Podobne Aukcje */}
        <div>
          <h4 className="font-semibold mb-2">Podobne Zakończone Aukcje</h4>
          <ul className="space-y-2">
            {similar_vehicles.map((vehicle) => (
              <li key={vehicle.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <Link href={`/aukcje/${vehicle.id}`} className="text-primary hover:underline flex items-center">
                  {vehicle.title}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
                <span className="font-semibold">{formatCurrency(vehicle.final_price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}