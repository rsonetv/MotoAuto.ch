// Type definitions for advanced vehicle search component

// Props types (data passed to components)
export interface AdvancedVehicleSearchProps {
  initialFilters: SearchFilters;
  recentSearches: string[];
  popularSearches: string[];
  brands: BrandsByCategory;
  models: ModelsByBrand;
  locations: string[];
  quickFilters: QuickFilter[];
  onSearch?: (filters: SearchFilters) => void;
  onFiltersChange?: (filters: Partial<SearchFilters>) => void;
  className?: string;
}

export interface SearchFilters {
  search: string;
  category: 'all' | 'auto' | 'moto';
  brand?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  currency: 'CHF' | 'EUR' | 'USD';
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  condition?: string;
  location?: string;
  radius: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'mileage' | 'year' | 'relevance';
}

export interface BrandsByCategory {
  auto: string[];
  moto: string[];
}

export interface ModelsByBrand {
  [brand: string]: string[];
}

export interface QuickFilter {
  label: string;
  filter: Partial<SearchFilters>;
}

// Query types (API response data)
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'brand' | 'model' | 'keyword';
  category?: 'auto' | 'moto';
  count?: number;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
  popular: SearchSuggestion[];
  recent: SearchSuggestion[];
}