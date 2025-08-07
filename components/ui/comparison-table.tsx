'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { useComparisonStore } from '@/hooks/use-comparison-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from './button'

export default function ComparisonTable() {
  const { vehicles, removeFromCompare } = useComparisonStore()

  const attributes = [
    { key: 'price', label: 'Cena' },
    { key: 'year', label: 'Rocznik' },
    { key: 'mileage', label: 'Przebieg' },
    { key: 'engine_size', label: 'Silnik' },
    { key: 'power', label: 'Moc' },
  ]

  const formatValue = (key: string, value: number) => {
    switch (key) {
      case 'price':
        return new Intl.NumberFormat('pl-PL', {
          style: 'currency',
          currency: 'PLN',
        }).format(value)
      case 'mileage':
        return `${new Intl.NumberFormat('pl-PL').format(value)} km`
      case 'engine_size':
        return `${value} cm³`
      case 'power':
        return `${value} KM`
      default:
        return value
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Atrybut</TableHead>
            {vehicles.map((vehicle) => (
              <TableHead key={vehicle.id} className="min-w-[200px] text-center">
                <div className="relative mx-auto h-32 w-48">
                  <Image
                    src={vehicle.image_url}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                </div>
                <p className="mt-2 font-semibold">
                  {vehicle.make} {vehicle.model}
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-2"
                  onClick={() => removeFromCompare(vehicle.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Usuń
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map((attr) => (
            <TableRow key={attr.key}>
              <TableCell className="font-semibold">{attr.label}</TableCell>
              {vehicles.map((vehicle) => (
                <TableCell key={vehicle.id} className="text-center">
                  {formatValue(attr.key, vehicle[attr.key as keyof typeof vehicle] as number)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}