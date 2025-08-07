import { PackageSelection } from "@/components/dashboard/package-selection";
import { SecondChanceOffer } from "@/components/dashboard/second-chance-offer";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/actions/user";
import { getSecondChanceOffers } from "@/lib/queries/auctions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const secondChanceOffers = await getSecondChanceOffers(user.id);

  return (
    <div className="space-y-6">
      {secondChanceOffers.map((offer) => (
        <SecondChanceOffer
          key={offer.transaction_id}
          transactionId={offer.transaction_id}
          listingTitle={offer.title}
          offerPrice={offer.amount}
          currency={offer.currency}
        />
      ))}
      <div>
        <h3 className="text-lg font-medium">Pakiety</h3>
        <p className="text-sm text-muted-foreground">
          Wybierz pakiet, który najlepiej odpowiada Twoim potrzebom.
        </p>
      </div>
      <Separator />
      <PackageSelection />
    </div>
  );
}