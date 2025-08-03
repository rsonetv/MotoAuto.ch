"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  Eye,
  MessageSquare,
  Gavel,
  Car,
  Heart,
  Bell
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'view' | 'message' | 'bid' | 'favorite' | 'listing_update'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  listing?: {
    id: string
    title: string
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'view',
      title: 'Nowe wyświetlenie',
      description: 'BMW X5 2020 - wyświetlone przez Jan Kowalski',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: { name: 'Jan Kowalski' },
      listing: { id: '1', title: 'BMW X5 2020' }
    },
    {
      id: '2',
      type: 'message',
      title: 'Nowa wiadomość',
      description: 'Pytanie o Audi A4 - czy pojazd jest serwisowany?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: { name: 'Anna Nowak' },
      listing: { id: '2', title: 'Audi A4 2019' }
    },
    {
      id: '3',
      type: 'bid',
      title: 'Nowa oferta',
      description: 'Otrzymałeś ofertę 45,000 CHF za Mercedes C-Class',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      user: { name: 'Peter Müller' },
      listing: { id: '3', title: 'Mercedes C-Class 2021' }
    },
    {
      id: '4',
      type: 'favorite',
      title: 'Dodano do ulubionych',
      description: 'Twoje Porsche 911 zostało dodane do ulubionych',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      user: { name: 'Michel Dubois' },
      listing: { id: '4', title: 'Porsche 911 2022' }
    },
    {
      id: '5',
      type: 'listing_update',
      title: 'Ogłoszenie zaktualizowane',
      description: 'Twoje ogłoszenie Toyota Prius zostało automatycznie odświeżone',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      listing: { id: '5', title: 'Toyota Prius 2020' }
    }
  ])

  const getActivityIcon = (type: string) => {
    const iconMap = {
      view: Eye,
      message: MessageSquare,
      bid: Gavel,
      favorite: Heart,
      listing_update: Car
    }
    return iconMap[type as keyof typeof iconMap] || Activity
  }

  const getActivityColor = (type: string) => {
    const colorMap = {
      view: 'text-blue-600 dark:text-blue-400',
      message: 'text-green-600 dark:text-green-400',
      bid: 'text-orange-600 dark:text-orange-400',
      favorite: 'text-red-600 dark:text-red-400',
      listing_update: 'text-purple-600 dark:text-purple-400'
    }
    return colorMap[type as keyof typeof colorMap] || 'text-muted-foreground'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Ostatnia aktywność</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Brak ostatniej aktywności</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)

              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-accent ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true, 
                          locale: pl 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
