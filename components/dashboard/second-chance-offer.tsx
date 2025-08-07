'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface SecondChanceOfferProps {
  transactionId: string;
  listingTitle: string;
  offerPrice: number;
  currency: string;
}

export function SecondChanceOffer({
  transactionId,
  listingTitle,
  offerPrice,
  currency,
}: SecondChanceOfferProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfferAccepted, setIsOfferAccepted] = useState(false);

  const handleAcceptOffer = async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`/api/transactions/${transactionId}/accept-second-offer`, {
      method: 'POST',
    });

    if (response.ok) {
      setIsOfferAccepted(true);
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to accept offer.');
    }

    setIsLoading(false);
  };

  if (isOfferAccepted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offer Accepted!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have accepted the offer for {listingTitle}. Please proceed to payment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Second Chance Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The winner of the auction for "{listingTitle}" did not complete the payment.</p>
        <p>You have the opportunity to purchase it for your last bid of {offerPrice} {currency}.</p>
        <Button onClick={handleAcceptOffer} disabled={isLoading} className="mt-4">
          {isLoading ? 'Accepting...' : 'Accept Offer'}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}