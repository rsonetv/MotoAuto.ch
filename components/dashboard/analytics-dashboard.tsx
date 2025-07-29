"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, Eye, Users, Clock } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function AnalyticsDashboard() {
  const [viewsData, setViewsData] = useState([
    { name: 'Pon', views: 120 },
    { name: 'Wt', views: 150 },
    { name: 'Śr', views: 180 },
    { name: 'Czw', views: 220 },
    { name: 'Pt', views: 190 },
    { name: 'Sob', views: 280 },
    { name: 'Nd', views: 240 }
  ])

  const [categoryData, setCategoryData] = useState([
    { name: 'Samochody', value: 65 },
    { name: 'Motocykle', value: 25 },
    { name: 'Części', value: 10 }
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart className="w-5 h-5" />
          <span>Analityka tygodniowa</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Wyświetlenia w czasie */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">
              Wyświetlenia w ostatnim tygodniu
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statystyki kategorii */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">
              Rozkład ogłoszeń po kategoriach
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium">{entry.value}%</span>
                  </div>
                ))}
              </div>
              <div className="w-24 h-24 ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={35}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
