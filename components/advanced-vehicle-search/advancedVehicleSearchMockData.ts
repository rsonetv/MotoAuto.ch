// Mock data for advanced vehicle search component
export const mockRootProps = {
  initialFilters: {
    search: '',
    category: 'all' as const,
    brand: undefined,
    model: undefined,
    priceMin: undefined,
    priceMax: undefined,
    currency: 'CHF' as const,
    yearMin: undefined,
    yearMax: undefined,
    mileageMax: undefined,
    fuelType: undefined,
    transmission: undefined,
    bodyType: undefined,
    condition: undefined,
    location: undefined,
    radius: 0,
    sortBy: 'newest' as const
  },
  recentSearches: [
    'BMW X5',
    'Toyota Corolla',
    'Mercedes C-Class',
    'Audi A4',
    'Tesla Model 3'
  ],
  popularSearches: [
    'SUV',
    'Elektryczny',
    'BMW',
    'Mercedes',
    'Toyota',
    'Hybrid',
    'Sedan',
    'Automatyczna'
  ],
  brands: {
    auto: [
      'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda',
      'Ford', 'Opel', 'Peugeot', 'Renault', 'Skoda', 'Volvo', 'Porsche',
      'Ferrari', 'Lamborghini', 'Tesla', 'Hyundai', 'Kia', 'Mazda', 'Nissan'
    ],
    moto: [
      'Yamaha', 'Honda', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'KTM',
      'Harley-Davidson', 'Triumph', 'Aprilia', 'MV Agusta', 'Husqvarna'
    ]
  },
  models: {
    'BMW': ['Seria 3', 'Seria 5', 'X3', 'X5', 'i4', 'iX'],
    'Mercedes-Benz': ['Klasa C', 'Klasa E', 'GLC', 'GLE', 'EQC', 'EQS'],
    'Audi': ['A3', 'A4', 'Q3', 'Q5', 'e-tron', 'Q7'],
    'Toyota': ['Corolla', 'RAV4', 'Yaris', 'Camry', 'C-HR', 'Prius'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X']
  },
  locations: [
    'Zürich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur',
    'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne'
  ],
  quickFilters: [
    { label: 'Elektryczny', filter: { fuelType: 'electric' } },
    { label: 'SUV', filter: { bodyType: 'suv' } },
    { label: 'Automatyczna', filter: { transmission: 'automatic' } },
    { label: 'Nowy', filter: { condition: 'new' } },
    { label: 'Do 50k CHF', filter: { priceMax: 50000 } },
    { label: 'BMW', filter: { brand: 'BMW' } },
    { label: 'Mercedes', filter: { brand: 'Mercedes-Benz' } },
    { label: 'Toyota', filter: { brand: 'Toyota' } }
  ]
};