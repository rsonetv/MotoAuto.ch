import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PackageSettings from "@/components/admin/settings/package-settings";
import LanguageSettings from "@/components/admin/settings/language-settings";
import RbacSettings from "@/components/admin/settings/rbac-settings";
import VatSettings from "@/components/admin/settings/vat-settings";

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="rbac">Access Control (RBAC)</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        <TabsContent value="packages">
          <PackageSettings />
        </TabsContent>
        <TabsContent value="languages">
          <LanguageSettings />
        </TabsContent>
        <TabsContent value="rbac">
          <RbacSettings />
        </TabsContent>
        <TabsContent value="financial">
          <VatSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}