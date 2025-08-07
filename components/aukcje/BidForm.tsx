'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BidFormProps {
  currentBid: number;
  minIncrement: number;
  reservePrice?: number;
  reserveMet: boolean;
  currency?: string;
  isLoggedIn: boolean;
  onSubmit: (amount: number, isAutoBid: boolean, maxBid?: number) => Promise<void>;
  onLoginRequired?: () => void;
}

export default function BidForm({
  currentBid,
  minIncrement,
  reservePrice,
  reserveMet,
  currency = 'CHF',
  isLoggedIn,
  onSubmit,
  onLoginRequired
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxBid, setMaxBid] = useState<string>('');


  const minBidAmount = currentBid + minIncrement;
  const maxBidAmount = 999999; // Maksymalna kwota oferty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    const amount = parseFloat(bidAmount);
    const maxBidAmountValue = isAutoBid ? parseFloat(maxBid) : undefined;
    setError('');

    // Walidacja kwoty
    if (isNaN(amount) || amount <= 0) {
      setError('Podaj prawidłową kwotę');
      return;
    }

    if (amount < minBidAmount) {
      setError(`Minimalna oferta to ${minBidAmount.toLocaleString()} ${currency}`);
      return;
    }

    if (amount > maxBidAmount) {
      setError(`Maksymalna oferta to ${maxBidAmount.toLocaleString()} ${currency}`);
      return;
    }

    if (isAutoBid) {
      if (!maxBidAmountValue || isNaN(maxBidAmountValue)) {
        setError('Podaj prawidłową maksymalną kwotę');
        return;
      }
      if (maxBidAmountValue < amount) {
        setError('Maksymalna oferta musi być wyższa lub równa Twojej ofercie.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit(amount, isAutoBid, maxBidAmountValue);
      setBidAmount('');
      setMaxBid('');
      setIsAutoBid(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas składania oferty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (increment: number) => {
    const quickBidAmount = currentBid + increment;
    setBidAmount(quickBidAmount.toString());
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Złóż ofertę
        </h3>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>Aktualna oferta: <span className="font-semibold text-primary">{currentBid.toLocaleString()} {currency}</span></p>
          <p>Minimalna oferta: <span className="font-semibold">{minBidAmount.toLocaleString()} {currency}</span></p>
          
          {reservePrice && (
            <p className="flex items-center gap-2">
              Cena minimalna: 
              {reserveMet ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ✓ Osiągnięta
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">
                  Nieosiągnięta
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {!isLoggedIn ? (
        <Alert className="mb-4">
          <AlertDescription>
            Aby składać oferty, musisz się zalogować.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimalna oferta: ${minBidAmount.toLocaleString()}`}
              min={minBidAmount}
              max={maxBidAmount}
              step={minIncrement}
              disabled={isSubmitting || !isLoggedIn}
              className="pr-16"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">{currency}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="auto-bid-switch"
            checked={isAutoBid}
            onChange={(e) => setIsAutoBid(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="auto-bid-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Licytuj inteligentnie (Proxy Bidding)
          </label>
        </div>

        {isAutoBid && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              System automatycznie będzie przebijał oferty innych za Ciebie, do podanej niżej maksymalnej kwoty.
            </p>
            <div className="relative">
              <Input
                type="number"
                value={maxBid}
                onChange={(e) => setMaxBid(e.target.value)}
                placeholder="Twoja maksymalna oferta"
                min={minBidAmount}
                disabled={isSubmitting || !isLoggedIn}
                className="pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Szybkie oferty */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(minIncrement)}
            disabled={isSubmitting || !isLoggedIn}
            className="text-xs"
          >
            +{minIncrement.toLocaleString()}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(minIncrement * 2)}
            disabled={isSubmitting || !isLoggedIn}
            className="text-xs"
          >
            +{(minIncrement * 2).toLocaleString()}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(minIncrement * 5)}
            disabled={isSubmitting || !isLoggedIn}
            className="text-xs"
          >
            +{(minIncrement * 5).toLocaleString()}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isSubmitting || !bidAmount || !isLoggedIn}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Składanie oferty...
            </>
          ) : (
            `Złóż ofertę ${bidAmount ? `- ${parseFloat(bidAmount).toLocaleString()} ${currency}` : ''}`
          )}
        </Button>
      </form>

      {/* Informacja o prowizji */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Prowizja aukcji:</strong> 5% z wygranej oferty (max. 500 {currency})
        </p>
      </div>

      {/* Zasady aukcji */}
      <details className="mt-4">
        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary">
          📋 Zasady aukcji
        </summary>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Każda aukcja rozpoczyna się od 1 CHF</p>
          <p>• Oferty w ostatnich 5 minutach przedłużają aukcję o 5 minut</p>
          <p>• Prowizja wynosi min. 5% z wygranej kwoty (max. 500 CHF)</p>
          <p>• Oferty są wiążące i nie można ich anulować</p>
          <p>• Cena minimalna jest ukryta do momentu jej osiągnięcia</p>
        </div>
      </details>
    </div>
  );
}