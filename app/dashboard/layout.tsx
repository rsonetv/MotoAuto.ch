import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import type { Database } from '@/lib/database.types'
import { clientEnv } from '@/lib/env.client'

export const metadata: Metadata = {
  title: 'Dashboard | MotoAuto.ch',
  description: 'Zarządzaj swoimi ogłoszeniami, licytacjami i profilem na MotoAuto.ch',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DashboardNav />
            </div>
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
