import { requireUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ProfilePage() {
  const user = await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi danymi osobowymi i ustawieniami konta.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacje osobowe</CardTitle>
            <CardDescription>Zaktualizuj swoje dane osobowe i adres e-mail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.profile?.avatar_url || "/placeholder.svg"}
                  alt={user.profile?.full_name || user.email}
                />
                <AvatarFallback className="text-lg">
                  {user.profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline">Zmień zdjęcie</Button>
                <p className="text-sm text-muted-foreground mt-2">JPG, GIF lub PNG. Maksymalnie 1MB.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Imię i nazwisko</Label>
                <Input id="full_name" defaultValue={user.profile?.full_name || ""} placeholder="Jan Kowalski" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input id="email" type="email" defaultValue={user.email || ""} disabled />
              </div>
            </div>

            <Button>Zapisz zmiany</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bezpieczeństwo</CardTitle>
            <CardDescription>Zarządzaj hasłem i ustawieniami bezpieczeństwa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Hasło</p>
                <p className="text-sm text-muted-foreground">Ostatnia zmiana: nigdy</p>
              </div>
              <Button variant="outline">Zmień hasło</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
