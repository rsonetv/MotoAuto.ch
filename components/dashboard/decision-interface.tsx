"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Database } from '@/lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface DecisionInterfaceProps {
  listing: Listing;
  onAction: (action: 'accept' | 'relist' | 'contact-second', listingId: string) => void;
}

export function DecisionInterface({ listing, onAction }: DecisionInterfaceProps) {
  const [secondBidderExists, setSecondBidderExists] = useState(false);

  useEffect(() => {
    // In a real implementation, you would fetch bids to check for a second bidder
    // For now, we'll just simulate this
    const checkSecondBidder = async () => {
      // const { data: bids, error } = await supabase
      //   .from('bids')
      //   .select('user_id')
      //   .eq('listing_id', listing.id)
      //   .order('amount', { ascending: false });
      
      // if (bids && bids.length > 1) {
      //   setSecondBidderExists(true);
      // }
      setSecondBidderExists(Math.random() > 0.5); // Simulate for now
    };

    checkSecondBidder();
  }, [listing.id]);

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800">Aukcja wymaga Twojej decyzji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Najwyższa oferta</p>
          <p className="text-lg font-bold">{listing.current_bid?.toLocaleString()} {listing.currency}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Cena minimalna</p>
          <p className="text-lg font-bold">{listing.reserve_price?.toLocaleString()} {listing.currency}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Czas na decyzję</p>
          {listing.decision_deadline && <CountdownTimer targetDate={new Date(listing.decision_deadline)} />}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => onAction('accept', listing.id)}>Akceptuj najwyższą ofertę</Button>
        <Button variant="outline" onClick={() => onAction('relist', listing.id)}>Odrzuć i wystaw ponownie</Button>
        {secondBidderExists && (
          <Button variant="outline" onClick={() => onAction('contact-second', listing.id)}>
            Odrzuć i skontaktuj się z drugim oferentem
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}