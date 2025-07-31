import { PackageSelection } from "@/components/dashboard/package-selection";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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