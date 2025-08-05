"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Calendar, 
  Gauge,
  Fuel,
  RotateCcw,
  Settings,
  TrendingUp,
  Zap
} from "lucide-react"
import Image from "next/image"
import { useSwipeGestures } from "../hooks/useSwipeGestures"
import { AutoSwipeProps, VehicleRecommendation } from "../schema"
import { formatBidAmount } from "../string-formatters"

interface SwipeCardProps {
  vehicle: VehicleRecommendation
  onSwipe: (action: 'like' | 'dislike' | 'super_like') => void
  isTop: boolean
}

function SwipeCard({ vehicle, onSwipe, isTop }: SwipeCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      setSwipeDirection('left')
      setTimeout(() => onSwipe('dislike'), 300)
    },
    onSwipeRight: () => {
      setSwipeDirection('right')
      setTimeout(() => onSwipe('like'), 300)
    },
    onSwipeUp: () => {
      setSwipeDirection('up')
      setTimeout(() => onSwipe('super_like'), 300)
    }
  }, {
    threshold: 100,
    preventDefaultTouchmoveEvent: true
  })

  const handleButtonAction = (action: 'like' | 'dislike' | 'super_like') => {
    setSwipeDirection(action === 'like' ? 'right' : action === 'dislike' ? 'left' : 'up')
    setTimeout(() => onSwipe(action), 300)
  }

  return (
    <div
      ref={swipeRef}
      className={`absolute inset-0 transition-transform duration-300 ${
        swipeDirection === 'left' ? 'transform -translate-x-full rotate-12' :
        swipeDirection === 'right' ? 'transform translate-x-full -rotate-12' :
        swipeDirection === 'up' ? 'transform -translate-y-full scale-110' :
        ''
      } ${isTop ? 'z-20' : 'z-10 scale-95 opacity-70'}`}
    >
      <Card className="h-full overflow-hidden shadow-xl">
        <div className="relative h-64">
          <Image
            src={vehicle.images[0] || 'https://images.unsplash.com/photo-1706117948313-032944e7716d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBjYXIlMjB2ZWhpY2xlJTIwYXV0b21vYmlsZXxlbnwwfDB8fHwxNzU0NDA4ODQ1fDA&ixlib=rb-4.1.0&q=85'}
            alt={`${vehicle.title} - Bornil Amin on Unsplash`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          
          {/* Match Score */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-600 text-white font-bold">
              {vehicle.matchScore}% dopasowanie
            </Badge>
          </div>

          {/* Swipe Indicators */}
          {swipeDirection && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              {swipeDirection === 'left' && (
                <div className="text-red-500 text-6xl font-bold rotate-12">
                  <X className="w-20 h-20" />
                </div>
              )}
              {swipeDirection === 'right' && (
                <div className="text-green-500 text-6xl font-bold -rotate-12">
                  <Heart className="w-20 h-20 fill-current" />
                </div>
              )}
              {swipeDirection === 'up' && (
                <div className="text-blue-500 text-6xl font-bold">
                  <Star className="w-20 h-20 fill-current" />
                </div>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Vehicle Info */}
          <div>
            <h3 className="text-xl font-bold truncate">{vehicle.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {vehicle.year}
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                {vehicle.mileage.toLocaleString()} km
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-green-600">
            {formatBidAmount(vehicle.price)}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {vehicle.location}
          </div>

          {/* Match Reasons */}
          <div>
            <p className="text-sm font-medium mb-2">Dlaczego to dla Ciebie:</p>
            <div className="flex flex-wrap gap-1">
              {vehicle.reasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>

          {/* Match Score Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Dopasowanie</span>
              <span>{vehicle.matchScore}%</span>
            </div>
            <Progress value={vehicle.matchScore} className="h-2" />
          </div>
        </CardContent>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-red-50 border-red-200 touch-optimized"
            onClick={() => handleButtonAction('dislike')}
          >
            <X className="w-6 h-6 text-red-500" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-white shadow-lg hover:bg-blue-50 border-blue-200 touch-optimized"
            onClick={() => handleButtonAction('super_like')}
          >
            <Star className="w-7 h-7 text-blue-500" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-green-50 border-green-200 touch-optimized"
            onClick={() => handleButtonAction('like')}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function AutoSwipeInterface({
  recommendations,
  userPreferences,
  onSwipe,
  onPreferencesUpdate
}: AutoSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    liked: 0,
    disliked: 0,
    superLiked: 0
  })

  const handleSwipe = async (vehicleId: string, action: 'like' | 'dislike' | 'super_like') => {
    setIsLoading(true)
    
    // Update stats
    setStats(prev => ({
      ...prev,
      [action === 'like' ? 'liked' : action === 'dislike' ? 'disliked' : 'superLiked']: prev[action === 'like' ? 'liked' : action === 'dislike' ? 'disliked' : 'superLiked'] + 1
    }))

    // Call parent callback
    onSwipe?.(vehicleId, action)

    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setIsLoading(false)
    }, 300)
  }

  const resetStack = () => {
    setCurrentIndex(0)
    setStats({ liked: 0, disliked: 0, superLiked: 0 })
  }

  const currentVehicle = recommendations[currentIndex]
  const nextVehicle = recommendations[currentIndex + 1]
  const hasMoreVehicles = currentIndex < recommendations.length

  if (!hasMoreVehicles) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-2">Koniec rekomendacji!</h3>
          <p className="text-muted-foreground mb-4">
            Przejrzałeś wszystkie dostępne pojazdy
          </p>
          
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.liked}</div>
              <p className="text-muted-foreground">Polubione</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.superLiked}</div>
              <p className="text-muted-foreground">Super Like</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.disliked}</div>
              <p className="text-muted-foreground">Odrzucone</p>
            </div>
          </div>
        </div>

        <Button onClick={resetStack} className="touch-optimized">
          <RotateCcw className="w-4 h-4 mr-2" />
          Zacznij od nowa
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Auto Swipe</h2>
          <p className="text-muted-foreground">
            {recommendations.length - currentIndex} pozostałych
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="touch-optimized">
          <Settings className="w-4 h-4 mr-2" />
          Preferencje
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Postęp</span>
          <span>{currentIndex} / {recommendations.length}</span>
        </div>
        <Progress value={(currentIndex / recommendations.length) * 100} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Heart className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="font-bold text-green-600">{stats.liked}</div>
          <p className="text-xs text-green-700">Polubione</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="font-bold text-blue-600">{stats.superLiked}</div>
          <p className="text-xs text-blue-700">Super Like</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <X className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="font-bold text-red-600">{stats.disliked}</div>
          <p className="text-xs text-red-700">Odrzucone</p>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-96 mb-6">
        {nextVehicle && (
          <SwipeCard
            vehicle={nextVehicle}
            onSwipe={() => {}}
            isTop={false}
          />
        )}
        
        {currentVehicle && (
          <SwipeCard
            vehicle={currentVehicle}
            onSwipe={(action) => handleSwipe(currentVehicle.id, action)}
            isTop={true}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>💚 Przesuń w prawo aby polubić</p>
        <p>❤️ Przesuń w górę dla Super Like</p>
        <p>💔 Przesuń w lewo aby odrzucić</p>
      </div>
    </div>
  )
}