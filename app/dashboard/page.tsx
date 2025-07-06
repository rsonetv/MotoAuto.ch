import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserStats } from "@/components/dashboard/user-stats"
import { UserListings } from "@/components/dashboard/user-listings"
import { UserBids } from "@/components/dashboard/user-bids"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Zarządzaj swoimi ogłoszeniami i aukcjami.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DashboardNav />
          </div>
          <div className="lg:col-span-3 space-y-8">
            <UserStats />
            <UserListings />
            <UserBids />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
