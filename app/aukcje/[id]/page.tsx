'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Gauge, 
  Car,
  Heart,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import AuctionTimer from '@/components/aukcje/auction-timer';
import BidForm from '@/components/aukcje/bid-form';
import BidHistory from '@/components/aukcje/bid-history';
import Image from 'next/image';

// Mock data - w prawdziwej aplikacji pobierane z API na podstawie ID
const mockAuctionData = {
  id: '101',
  title: 'Porsche 911 Turbo S',
  category: 'auto',
  description: `Niesamowity Porsche 911 Turbo S w perfekcyjnym stanie. Pojazd regularnie serwisowany w autoryzowanym serwisie Porsche, pełna dokumentacja serwisowa dostępna.

Wyposażenie:
• Sport Chrono Package
• PASM (Porsche Active Suspension Management)
• Sport Exhaust System
• Carbon Ceramic Brakes (PCCB)
• Adaptive Cruise Control
• Bose Sound System
• Sport Seats Plus
• Alcantara Interior Package

Pojazd bezwypadkowy, pierwszy właściciel, kupiony w salon Porsche Centrum Zürich. Wszystkie serwisy wykonywane zgodnie z harmonogramem.`,
  
  images: [
    'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
  ],
  
  currentBid: 125000,
  startingBid: 1,
  reservePrice: 140000,
  reserveMet: false,
  minIncrement: 1000,
  endsAt: '2025-07-29T18:00:00Z',
  softClose: true,
  extensionSec: 300,
  
  location: 'Lausanne, VD',
  year: 2021,
  mileage: 25000,
  fuel: 'Benzyna',
  transmission: 'PDK',
  power: '650 KM',
  
  seller: {
    name: 'Porsche Centrum Lausanne',
    type: 'dealer',
    rating: 4.9,
    verified: true
  },
  
  bidCount: 23,
  watchCount: 89,
  viewCount: 456
};

const mockBids = [
  {
    id: '1',
    amount: 125000,
    bidder: { id: '1', name: 'Markus Weber' },
    timestamp: '2025-07-28T16:30:00Z',
    isWinning: true
  },
  {
    id: '2',
    amount: 124000,
    bidder: { id: '2', name: 'Anna Müller' },
    timestamp: '2025-07-28T16:15:00Z',
    isWinning: false
  },
  {
    id: '3',
    amount: 123000,
    bidder: { id: '3', name: 'Peter Schmidt' },
    timestamp: '2025-07-28T15:45:00Z',
    isWinning: false
  }
];

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [auctionData, setAuctionData] = useState(mockAuctionData);
  const [bids, setBids] = useState(mockBids);
  const [isLoggedIn] = useState(true); // Mock login state

  const handleBidSubmit = async (amount: number) => {
    try {
      // Tutaj byłoby API call
      const newBid = {
        id: Date.now().toString(),
        amount,
        bidder: { id: 'current-user', name: 'Ty' },
        timestamp: new Date().toISOString(),
        isWinning: true
      };

      // Aktualizuj poprzednie oferty
      const updatedBids = bids.map(bid => ({ ...bid, isWinning: false }));
      setBids([newBid, ...updatedBids]);
      
      // Aktualizuj current bid
      setAuctionData(prev => ({ 
        ...prev, 
        currentBid: amount,
        bidCount: prev.bidCount + 1,
        reserveMet: amount >= prev.reservePrice
      }));

    } catch (error) {
      throw new Error('Nie udało się złożyć oferty. Spróbuj ponownie.');
    }
  };

  const handleTimeExtended = (newEndTime: string) => {
    setAuctionData(prev => ({ ...prev, endsAt: newEndTime }));
  };

  const toggleWatch = () => {
    setIsWatching(!isWatching);
    // Tutaj byłoby API call
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCommissionAmount = () => {
    return Math.min(auctionData.currentBid * 0.05, 500);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do aukcji
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {auctionData.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleWatch}>
                      <Heart className={`w-4 h-4 mr-1 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                      {auctionData.watchCount}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Udostępnij
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="secondary">
                    {auctionData.category === 'auto' ? '🚗 Samochody' : '🏍️ Motocykle'}
                  </Badge>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {auctionData.location}
                  </span>
                  <span>{auctionData.viewCount} wyświetleń</span>
                </div>
              </div>

              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={auctionData.images[currentImageIndex]}
                      alt={`${auctionData.title} - zdjęcie ${currentImageIndex + 1}`}
                      width={800}
                      height={600}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    
                    {/* Image Navigation */}
                    {auctionData.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-2">
                          {auctionData.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {auctionData.images.length > 1 && (
                    <div className="p-4 border-t">
                      <div className="flex space-x-2 overflow-x-auto">
                        {auctionData.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-15 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex
                                ? 'border-primary'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`Miniatura ${index + 1}`}
                              width={80}
                              height={60}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Szczegóły pojazdu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.year}</div>
                      <div className="text-sm text-gray-500">Rok produkcji</div>
                    </div>
                    <div className="text-center">
                      <Gauge className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.mileage.toLocaleString()} km</div>
                      <div className="text-sm text-gray-500">Przebieg</div>
                    </div>
                    <div className="text-center">
                      <Car className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.transmission}</div>
                      <div className="text-sm text-gray-500">Skrzynia</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                        P
                      </div>
                      <div className="font-semibold">{auctionData.power}</div>
                      <div className="text-sm text-gray-500">Moc</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Opis pojazdu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {auctionData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Bidding */}
            <div className="space-y-6">
              {/* Auction Timer */}
              <AuctionTimer
                endsAt={auctionData.endsAt}
                softClose={auctionData.softClose}
                extensionSec={auctionData.extensionSec}
                onTimeExtended={handleTimeExtended}
              />

              {/* Current Status */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatCurrency(auctionData.currentBid)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Aktualna najwyższa oferta
                    </p>
                    
                    <div className="flex justify-center items-center space-x-4 text-sm">
                      <span>{auctionData.bidCount} ofert</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="flex items-center">
                        {auctionData.reserveMet ? (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Cena minimalna osiągnięta
                          </span>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="w-4 h-4 mr-1 inline" />
                            Cena minimalna nieosiągnięta
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bid Form */}
              <BidForm
                currentBid={auctionData.currentBid}
                minIncrement={auctionData.minIncrement}
                reservePrice={auctionData.reservePrice}
                reserveMet={auctionData.reserveMet}
                currency="CHF"
                isLoggedIn={isLoggedIn}
                onSubmit={handleBidSubmit}
              />

              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Sprzedawca</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{auctionData.seller.name}</span>
                        {auctionData.seller.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Zweryfikowany
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ocena: {auctionData.seller.rating}/5 ⭐
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Kontakt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Info */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Prowizja aukcji:</strong> {formatCurrency(getCommissionAmount())} 
                  ({Math.min(5, (getCommissionAmount() / auctionData.currentBid) * 100).toFixed(1)}% z aktualnej oferty, max. 500 CHF)
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Bid History */}
          <div className="mt-8">
            <BidHistory
              bids={bids}
              currency="CHF"
              isLive={true}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
