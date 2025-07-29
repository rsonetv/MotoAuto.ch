"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Shield,
  Camera,
  Save,
  Bell,
  Lock,
  CreditCard,
  Award,
  CheckCircle2
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  canton: string
  postal_code: string
  dealer_name?: string
  is_dealer: boolean
  is_verified: boolean
  avatar_url?: string
  bio?: string
  website?: string
  vat_number?: string
  dealer_license?: string
  rating: number
  total_sales: number
  created_at: string
  
  // Ustawienia powiadomień
  email_notifications: boolean
  sms_notifications: boolean
  marketing_emails: boolean
  bid_notifications: boolean
  listing_updates: boolean
}

const SWISS_CANTONS = [
  'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
  'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura',
  'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
  'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud',
  'Zug', 'Zürich'
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        ...data,
        email: user.email || '',
        // Domyślne wartości dla powiadomień jeśli nie są ustawione
        email_notifications: data.email_notifications ?? true,
        sms_notifications: data.sms_notifications ?? false,
        marketing_emails: data.marketing_emails ?? false,
        bid_notifications: data.bid_notifications ?? true,
        listing_updates: data.listing_updates ?? true
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Błąd podczas ładowania profilu')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Profil został zaktualizowany')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Błąd podczas aktualizacji profilu')
    } finally {
      setSaving(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    const formData = new FormData(e.currentTarget)
    const updates = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      location: formData.get('location') as string,
      canton: formData.get('canton') as string,
      postal_code: formData.get('postal_code') as string,
      bio: formData.get('bio') as string,
      website: formData.get('website') as string,
      dealer_name: formData.get('dealer_name') as string,
      vat_number: formData.get('vat_number') as string,
      dealer_license: formData.get('dealer_license') as string
    }

    updateProfile(updates)
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      if (!profile) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: data.publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Błąd podczas przesyłania zdjęcia')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nie można załadować profilu
          </h3>
          <p className="text-gray-600">
            Wystąpił błąd podczas ładowania danych profilu.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil użytkownika</h1>
          <p className="text-gray-600">Zarządzaj swoimi danymi i ustawieniami</p>
        </div>
        <div className="flex items-center space-x-2">
          {profile.is_verified && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Zweryfikowany
            </Badge>
          )}
          {profile.is_dealer && (
            <Badge variant="default" className="bg-purple-100 text-purple-800">
              <Building className="w-4 h-4 mr-1" />
              Dealer
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar z informacjami o profilu */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full p-2"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAvatarUpload(file)
                  }}
                />
              </div>

              <h3 className="font-semibold text-lg text-gray-900">
                {profile.full_name || 'Brak imienia'}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{profile.email}</p>
              
              {profile.is_dealer && profile.dealer_name && (
                <p className="text-purple-600 text-sm font-medium mb-2">
                  {profile.dealer_name}
                </p>
              )}

              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(profile.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({profile.rating.toFixed(1)})
                </span>
              </div>

              <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">
                  Sprzedanych pojazdów: <strong>{profile.total_sales}</strong>
                </div>
                <div className="text-sm text-gray-600">
                  Członek od: <strong>
                    {new Date(profile.created_at).getFullYear()}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Główny panel z ustawieniami */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Dane osobowe</TabsTrigger>
              <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
              <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informacje podstawowe</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Imię i nazwisko *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          defaultValue={profile.full_name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={profile.phone}
                          placeholder="+41 79 123 45 67"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Miejscowość</Label>
                        <Input
                          id="location"
                          name="location"
                          defaultValue={profile.location}
                          placeholder="Zürich"
                        />
                      </div>
                      <div>
                        <Label htmlFor="canton">Kanton</Label>
                        <Select name="canton" defaultValue={profile.canton}>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz kanton" />
                          </SelectTrigger>
                          <SelectContent>
                            {SWISS_CANTONS.map(canton => (
                              <SelectItem key={canton} value={canton}>
                                {canton}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="postal_code">Kod pocztowy</Label>
                        <Input
                          id="postal_code"
                          name="postal_code"
                          defaultValue={profile.postal_code}
                          placeholder="8001"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">O mnie</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio}
                        placeholder="Opisz siebie w kilku słowach..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Strona internetowa</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        defaultValue={profile.website}
                        placeholder="https://..."
                      />
                    </div>

                    {profile.is_dealer && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dealer_name">Nazwa firmy</Label>
                            <Input
                              id="dealer_name"
                              name="dealer_name"
                              defaultValue={profile.dealer_name}
                              placeholder="Auto Dealer GmbH"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vat_number">Numer VAT</Label>
                            <Input
                              id="vat_number"
                              name="vat_number"
                              defaultValue={profile.vat_number}
                              placeholder="CHE-123.456.789"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="dealer_license">Licencja dealera</Label>
                          <Input
                            id="dealer_license"
                            name="dealer_license"
                            defaultValue={profile.dealer_license}
                            placeholder="Numer licencji"
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Zapisywanie...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Zapisz zmiany
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Ustawienia powiadomień</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Powiadomienia email</h4>
                      <p className="text-sm text-gray-600">
                        Otrzymuj powiadomienia na adres email
                      </p>
                    </div>
                    <Switch
                      checked={profile.email_notifications}
                      onCheckedChange={(checked) => 
                        updateProfile({ email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Powiadomienia SMS</h4>
                      <p className="text-sm text-gray-600">
                        Otrzymuj powiadomienia tekstowe na telefon
                      </p>
                    </div>
                    <Switch
                      checked={profile.sms_notifications}
                      onCheckedChange={(checked) => 
                        updateProfile({ sms_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Powiadomienia o licytacjach</h4>
                      <p className="text-sm text-gray-600">
                        Powiadomienia o nowych ofertach i zakończonych aukcjach
                      </p>
                    </div>
                    <Switch
                      checked={profile.bid_notifications}
                      onCheckedChange={(checked) => 
                        updateProfile({ bid_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Aktualizacje ogłoszeń</h4>
                      <p className="text-sm text-gray-600">
                        Powiadomienia o statusie Twoich ogłoszeń
                      </p>
                    </div>
                    <Switch
                      checked={profile.listing_updates}
                      onCheckedChange={(checked) => 
                        updateProfile({ listing_updates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Newsletter marketingowy</h4>
                      <p className="text-sm text-gray-600">
                        Informacje o nowościach i promocjach
                      </p>
                    </div>
                    <Switch
                      checked={profile.marketing_emails}
                      onCheckedChange={(checked) => 
                        updateProfile({ marketing_emails: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Bezpieczeństwo konta</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Zmiana hasła</h4>
                      <p className="text-sm text-gray-600">
                        Zaktualizuj swoje hasło dostępu
                      </p>
                    </div>
                    <Button variant="outline">
                      Zmień hasło
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Weryfikacja telefonu</h4>
                      <p className="text-sm text-gray-600">
                        {profile.phone ? 'Zweryfikuj swój numer telefonu' : 'Dodaj numer telefonu'}
                      </p>
                    </div>
                    <Button variant="outline" disabled={!profile.phone}>
                      {profile.phone ? 'Zweryfikuj' : 'Dodaj telefon'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Dwuetapowa weryfikacja</h4>
                      <p className="text-sm text-gray-600">
                        Dodaj dodatkową warstwę bezpieczeństwa
                      </p>
                    </div>
                    <Button variant="outline">
                      Konfiguruj
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Aktywne sesje</h4>
                      <p className="text-sm text-gray-600">
                        Zarządzaj swoimi aktywnymi sesjami
                      </p>
                    </div>
                    <Button variant="outline">
                      Wyloguj wszystkie
                    </Button>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Usuń konto</h4>
                    <p className="text-sm text-red-600 mb-3">
                      Permanentnie usuń swoje konto i wszystkie dane.
                    </p>
                    <Button variant="destructive" size="sm">
                      Usuń konto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
