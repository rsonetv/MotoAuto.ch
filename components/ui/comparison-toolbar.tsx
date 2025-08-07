'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { useComparisonStore } from '@/hooks/use-comparison-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ComparisonTable from './comparison-table'

export default function ComparisonToolbar() {
  const { vehicles, removeFromCompare } = useComparisonStore()

  if (vehicles.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Porównujesz:</span>
          <div className="flex items-center gap-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="relative h-16 w-24 rounded-md">
                <Image
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
                <button
                  onClick={() => removeFromCompare(vehicle.id)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  aria-label="Remove from comparison"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg">Porównaj teraz ({vehicles.length})</Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Porównanie pojazdów</DialogTitle>
            </DialogHeader>
            <ComparisonTable />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}