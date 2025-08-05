// Enhanced string formatters for platform features
export const formatBidAmount = (amount: number, currency: string = 'CHF'): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatTimeRemaining = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Zakończona';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const formatBidIncrement = (increment: number, currency: string = 'CHF'): string => {
  return `+${formatBidAmount(increment, currency)}`;
};

export const formatAuctionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'upcoming': 'Nadchodząca',
    'live': 'Na żywo',
    'ending_soon': 'Kończy się',
    'ended': 'Zakończona',
    'extended': 'Przedłużona'
  };
  return statusMap[status] || status;
};

export const formatNotificationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'bid_placed': 'Nowa oferta',
    'outbid': 'Przebito Twoją ofertę',
    'auction_ending': 'Aukcja kończy się',
    'auction_won': 'Wygrałeś aukcję',
    'auction_lost': 'Przegrałeś aukcję',
    'auction_extended': 'Aukcja przedłużona'
  };
  return typeMap[type] || type;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatMediaDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatShareText = (title: string, price: number, url: string): string => {
  return `Sprawdź ten pojazd: ${title} za ${formatBidAmount(price)} - ${url}`;
};

export const formatInventoryStatus = (quantity: number, threshold: number = 5): string => {
  if (quantity === 0) return 'Brak w magazynie';
  if (quantity <= threshold) return `Niska dostępność (${quantity})`;
  return `Dostępne (${quantity})`;
};