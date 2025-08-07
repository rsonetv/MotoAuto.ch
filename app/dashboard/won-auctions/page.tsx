import { getUserWonAuctions } from "@/lib/queries/auctions";
import { getCurrentUser } from "@/lib/actions/user";
import { Listing } from "@/types/database.types";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReviewForm } from "@/components/forms/review-form";

export default async function WonAuctionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const wonAuctions = await getUserWonAuctions(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje Wygrane Aukcje</CardTitle>
        <CardDescription>
          Tutaj znajdziesz wszystkie aukcje, które wygrałeś.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wonAuctions.length === 0 ? (
          <p>Nie wygrałeś jeszcze żadnej aukcji.</p>
        ) : (
          <ul className="space-y-4">
            {wonAuctions.map((auction) => (
              <li key={auction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{auction.title}</h3>
                  <p className="text-sm text-gray-500">
                    Zakończona: {new Date(auction.auction_end_time).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-bold">
                    Cena: {auction.current_bid} {auction.currency}
                  </p>
                  {auction.payment_status === 'cancelled_no_payment' && (
                    <p className="text-sm text-red-500">Płatność anulowana (brak wpłaty)</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {auction.payment_status !== 'cancelled_no_payment' && (
                    <Button asChild>
                      <Link href={`/dashboard/contracts/${auction.id}`}>Zobacz umowę</Link>
                    </Button>
                  )}
                  {auction.payment_id && auction.payment_status === 'completed' && (
                    <ReviewForm paymentId={auction.payment_id} listingTitle={auction.title} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}