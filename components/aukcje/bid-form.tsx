'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gavel, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BidFormProps {
  currentBid: number;
  minIncrement: number;
  reservePrice: number;
  reserveMet: boolean;
  currency: string;
  isLoggedIn: boolean;
  onSubmit: (amount: number) => Promise<void>;
}

export default function BidForm({
  currentBid,
  minIncrement,
  reservePrice,
  reserveMet,
  currency,
  isLoggedIn,
  onSubmit
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error('Musisz być zalogowany, aby składać oferty');
      return;
    }

    if (bidAmount <= currentBid) {
      toast.error(`Oferta musi być wyższa niż ${formatCurrency(currentBid)}`);
      return;
    }

    if (bidAmount < currentBid + minIncrement) {
      toast.error(`Minimalne podbicie to ${formatCurrency(minIncrement)}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(bidAmount);
      toast.success('Oferta została złożona pomyślnie!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas składania oferty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickBidAmounts = [
    currentBid + minIncrement,
    currentBid + minIncrement * 2,
    currentBid + minIncrement * 5,
    Math.max(reservePrice, currentBid + minIncrement * 10)
  ];

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Złóż ofertę
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Musisz być zalogowany, aby składać oferty w aukcjach.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <Button className="w-full">
              Zaloguj się
            </Button>
            <Button variant="outline" className="w-full">
              Zarejestruj się
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Złóż ofertę
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reserve Price Warning */}
        {!reserveMet && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cena minimalna:</strong> {formatCurrency(reservePrice)}
              <br />
              Aukcja zakończy się sukcesem tylko jeśli zostanie osiągnięta cena minimalna.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Bid Buttons */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Szybkie oferty</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickBidAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBidAmount(amount)}
                className="text-xs"
              >
                {formatCurrency(amount)}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Bid Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bidAmount">Twoja oferta</Label>
            <div className="relative">
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={currentBid + minIncrement}
                step={minIncrement}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimalna oferta: {formatCurrency(currentBid + minIncrement)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || bidAmount <= currentBid}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Składanie oferty...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Złóż ofertę {formatCurrency(bidAmount)}
              </>
            )}
          </Button>
        </form>

        {/* Bid Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Oferty są wiążące i nie można ich anulować</p>
          <p>• Minimalne podbicie: {formatCurrency(minIncrement)}</p>
          <p>• Prowizja aukcji: 5% (max. 500 {currency})</p>
        </div>
      </CardContent>
    </Card>
  );
}