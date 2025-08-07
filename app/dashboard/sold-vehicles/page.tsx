import { getUserSoldVehicles } from "@/lib/queries/auctions";
import { getCurrentUser } from "@/lib/actions/user";
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
import { Listing } from "@/types/database.types";

export default async function SoldVehiclesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const soldVehicles = await getUserSoldVehicles(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje Sprzedane Pojazdy</CardTitle>
        <CardDescription>
          Tutaj znajdziesz wszystkie pojazdy, które sprzedałeś na aukcjach.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {soldVehicles.length === 0 ? (
          <p>Nie sprzedałeś jeszcze żadnego pojazdu.</p>
        ) : (
          <ul className="space-y-4">
            {soldVehicles.map((vehicle: Listing) => (
              <li key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{vehicle.title}</h3>
                  <p className="text-sm text-gray-500">
                    Sprzedany: {new Date(vehicle.auction_end_time).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-bold">
                    Cena: {vehicle.current_bid} {vehicle.currency}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/contracts/${vehicle.id}`}>Zobacz umowę</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}