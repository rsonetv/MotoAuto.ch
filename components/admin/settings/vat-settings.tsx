import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VatSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="vat-rate">VAT Rate (%)</Label>
          <Input id="vat-rate" defaultValue="8.1" />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => console.log("Saving VAT settings...")}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}