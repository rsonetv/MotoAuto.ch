// String formatting functions for vehicle search
export const formatPrice = (price: number, currency: string = 'CHF'): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat('de-CH').format(mileage) + ' km';
};

export const formatYear = (year: number): string => {
  return year.toString();
};

export const formatRadius = (radius: number): string => {
  return radius === 0 ? 'Cała Szwajcaria' : `${radius} km`;
};

export const formatFuelType = (fuelType: string): string => {
  const fuelTypeMap: Record<string, string> = {
    'gasoline': 'Benzyna',
    'diesel': 'Diesel',
    'electric': 'Elektryczny',
    'hybrid': 'Hybryda',
    'plugin_hybrid': 'Hybryda plug-in',
    'gas': 'Gaz',
    'ethanol': 'Etanol'
  };
  return fuelTypeMap[fuelType] || fuelType;
};

export const formatTransmission = (transmission: string): string => {
  const transmissionMap: Record<string, string> = {
    'manual': 'Manualna',
    'automatic': 'Automatyczna',
    'semi_automatic': 'Półautomatyczna',
    'cvt': 'CVT'
  };
  return transmissionMap[transmission] || transmission;
};

export const formatCondition = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    'new': 'Nowy',
    'excellent': 'Doskonały',
    'very_good': 'Bardzo dobry',
    'good': 'Dobry',
    'fair': 'Przeciętny',
    'damaged': 'Uszkodzony'
  };
  return conditionMap[condition] || condition;
};