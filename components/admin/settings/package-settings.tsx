import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const packages = [
  {
    name: "Basic",
    price: "10",
    features: "10 listings, basic support",
  },
  {
    name: "Pro",
    price: "30",
    features: "50 listings, priority support, analytics",
  },
  {
    name: "Enterprise",
    price: "100",
    features: "Unlimited listings, dedicated support, advanced features",
  },
];

export default function PackageSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {packages.map((pkg, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4">
            <h3 className="font-semibold">{pkg.name}</h3>
            <div>
              <Label htmlFor={`price-${index}`}>Price ($)</Label>
              <Input id={`price-${index}`} defaultValue={pkg.price} />
            </div>
            <div>
              <Label htmlFor={`features-${index}`}>Features</Label>
              <Input id={`features-${index}`} defaultValue={pkg.features} />
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => console.log("Saving package settings...")}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}