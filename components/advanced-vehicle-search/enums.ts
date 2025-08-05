// Vehicle search related enums
export enum Currency {
  CHF = 'CHF',
  EUR = 'EUR', 
  USD = 'USD'
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PLUGIN_HYBRID = 'plugin_hybrid',
  GAS = 'gas',
  ETHANOL = 'ethanol'
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SEMI_AUTOMATIC = 'semi_automatic',
  CVT = 'cvt'
}

export enum BodyType {
  SEDAN = 'sedan',
  SUV = 'suv',
  COUPE = 'coupe',
  KOMBI = 'kombi',
  HATCHBACK = 'hatchback',
  CONVERTIBLE = 'convertible',
  PICKUP = 'pickup',
  VAN = 'van'
}

export enum VehicleCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  FAIR = 'fair',
  DAMAGED = 'damaged'
}

export enum SortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  MILEAGE = 'mileage',
  YEAR = 'year',
  RELEVANCE = 'relevance'
}

export enum VehicleCategory {
  AUTO = 'auto',
  MOTO = 'moto',
  ALL = 'all'
}