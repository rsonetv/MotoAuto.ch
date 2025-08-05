import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/admin/analytics/kpi-card";
import SalesChart from "@/components/admin/analytics/sales-chart";
import { getKpiData, getSalesData } from "@/lib/actions/analytics";

export default async function AnalyticsPage() {
  const kpiData = await getKpiData();
  const salesData = await getSalesData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Total Revenue" value={`$${kpiData.totalRevenue.toLocaleString()}`} />
        <KpiCard title="New Users (30 days)" value={kpiData.newUsers.toLocaleString()} />
        <KpiCard title="Listings Published" value={kpiData.listingsPublished.toLocaleString()} />
        <KpiCard title="Avg. Conversion Rate" value={`${kpiData.avgConversionRate}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">[Pie Chart Placeholder]</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Geolocations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">[Map Placeholder]</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}