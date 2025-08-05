import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const supportedLanguages = [
  { code: "pl", name: "Polish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "en", name: "English" },
];

export default function LanguageSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Supported Languages</Label>
          <div className="space-y-2">
            {supportedLanguages.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between p-2 border rounded-md">
                <span>{lang.name}</span>
                <Switch defaultChecked={true} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-language">Default Language</Label>
          <Select defaultValue="en">
            <SelectTrigger id="default-language">
              <SelectValue placeholder="Select default language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => console.log("Saving language settings...")}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}