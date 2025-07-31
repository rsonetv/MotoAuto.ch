import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/dashboard/settings/profile-form"
import { PasswordForm } from "@/components/dashboard/settings/password-form"
import { NotificationsForm } from "@/components/dashboard/settings/notifications-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Ustawienia</h3>
        <p className="text-sm text-muted-foreground">
          Zarządzaj ustawieniami swojego konta i preferencjami e-mail.
        </p>
      </div>
      <Separator />
      <ProfileForm user={user} />
      <Separator />
      <PasswordForm />
      <Separator />
      <NotificationsForm settings={settings} />
    </div>
  )
}