"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  BarChart3,
  Activity,
  Bell,
  Settings,
  Grip,
  RefreshCw
} from "lucide-react"
import { DashboardProps, DashboardWidget, WidgetPosition } from "../schema"
import { useSwipeGestures } from "../hooks/useSwipeGestures"
import { formatBidAmount, formatInventoryStatus } from "../string-formatters"

interface DraggableWidgetProps {
  widget: DashboardWidget
  onMove: (widgetId: string, position: WidgetPosition) => void
  onResize: (widgetId: string, size: string) => void
}

function DraggableWidget({ widget, onMove, onResize }: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      // Move widget left
      onMove(widget.id, { ...widget.position, x: Math.max(0, widget.position.x - 1) })
    },
    onSwipeRight: () => {
      // Move widget right
      onMove(widget.id, { ...widget.position, x: widget.position.x + 1 })
    }
  })

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!widget.isDraggable) return
    
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
  }

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatBidAmount(widget.data.totalSales)}
              </div>
              <p className="text-xs text-muted-foreground">Sprzedaż</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {widget.data.activeListing}
              </div>
              <p className="text-xs text-muted-foreground">Aktywne</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-semibold text-green-600">
                  +{widget.data.monthlyGrowth}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Wzrost</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {widget.data.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Wyświetlenia</p>
            </div>
          </div>
        )

      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {widget.data.totalVehicles}
                </div>
                <p className="text-sm text-muted-foreground">Pojazdy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {widget.data.lowStock}
                </div>
                <p className="text-sm text-muted-foreground">Niska dostępność</p>
              </div>
            </div>
            
            {widget.data.lowStock > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {widget.data.lowStock} pozycji wymaga uzupełnienia
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dostępność magazynu</span>
                <span>{Math.round((widget.data.totalVehicles - widget.data.outOfStock) / widget.data.totalVehicles * 100)}%</span>
              </div>
              <Progress 
                value={(widget.data.totalVehicles - widget.data.outOfStock) / widget.data.totalVehicles * 100}
                className="h-2"
              />
            </div>
          </div>
        )

      case 'recent_activity':
        return (
          <ScrollArea className="h-40">
            <div className="space-y-3">
              {widget.data.activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )

      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Widget: {widget.type}</p>
          </div>
        )
    }
  }

  return (
    <Card 
      ref={swipeRef}
      className={`relative transition-all duration-200 touch-optimized ${
        isDragging ? 'widget-dragging' : ''
      } ${widget.size === 'large' ? 'col-span-2' : ''}`}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{widget.title}</CardTitle>
          <div className="flex items-center gap-1">
            {widget.isDraggable && (
              <Button variant="ghost" size="sm" className="cursor-grab">
                <Grip className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  )
}

export function TouchOptimizedDashboard({
  widgets,
  isDealerAccount,
  inventoryData,
  onWidgetMove,
  onWidgetResize
}: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  // Pull to refresh
  const pullToRefreshRef = useSwipeGestures({
    onSwipeDown: () => {
      if (pullDistance > 100) {
        handleRefresh()
      }
    }
  }, {
    threshold: 50
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsRefreshing(false)
    setPullDistance(0)
    setIsPulling(false)
  }

  const handleWidgetMove = (widgetId: string, position: WidgetPosition) => {
    onWidgetMove?.(widgetId, position)
  }

  const handleWidgetResize = (widgetId: string, size: string) => {
    onWidgetResize?.(widgetId, size as any)
  }

  const quickActions = [
    { icon: Plus, label: 'Dodaj ogłoszenie', action: () => {} },
    { icon: Package, label: 'Zarządzaj magazynem', action: () => {} },
    { icon: BarChart3, label: 'Raporty', action: () => {} },
    { icon: Bell, label: 'Powiadomienia', action: () => {} },
    { icon: Settings, label: 'Ustawienia', action: () => {} }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Odświeżanie...' : 'Pociągnij aby odświeżyć'}</span>
          </div>
        </div>
      )}

      <div 
        ref={pullToRefreshRef}
        className="container mx-auto px-4 py-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isDealerAccount ? 'Panel Dealera' : 'Mój Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isDealerAccount ? 'Zarządzaj swoim biznesem' : 'Przegląd Twojej aktywności'}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-optimized"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </div>

        {/* Dealer-specific alerts */}
        {isDealerAccount && inventoryData && inventoryData.lowStock > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Uwaga: Niski stan magazynowy</h3>
                <p className="text-sm text-orange-700">
                  {inventoryData.lowStock} pozycji wymaga uzupełnienia zapasów
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {widgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              onMove={handleWidgetMove}
              onResize={handleWidgetResize}
            />
          ))}
        </div>

        {/* Add Widget Button */}
        <div className="text-center">
          <Button variant="outline" className="touch-optimized">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj widget
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
      <Sheet open={fabOpen} onOpenChange={setFabOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg fab-button"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Szybkie akcje</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col gap-2 touch-optimized"
                onClick={() => {
                  action.action()
                  setFabOpen(false)
                }}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}