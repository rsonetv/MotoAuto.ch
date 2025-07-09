import { ProfileForm } from "@/components/forms/profile-form"

export default function ProfilePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil użytkownika</h1>
        <p className="text-gray-600">Zarządzaj swoimi danymi osobowymi i ustawieniami konta.</p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </>
  )
}
