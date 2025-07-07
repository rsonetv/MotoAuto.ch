export interface Vehicle {
  id: string
  title: string
  brand: string
  model: string
  year: number
  priceCHF: number
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid"
  mileageKm: number
  location: string
  imageUrl: string
  createdAt: string
  description?: string
  transmission?: "Manual" | "Automatic"
  category: "moto" | "auto" | "auction"
}

export interface VehicleFilters {
  category: "moto" | "auto" | "auction"
  brand: string
  minPrice: number
  maxPrice: number
  minYear: number
  maxYear: number
  fuelType: string
  location: string
  search: string
}
