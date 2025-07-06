import { RegisterForm } from "@/components/forms/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Motorcycle image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src="/placeholder.svg?height=800&width=600" alt="Motorcycle" className="w-full h-full object-cover" />
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-bold block">
              MotoAuto<span className="text-red-500">.ch</span>
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Stwórz nowe konto</h2>
              <p className="text-gray-400">
                Masz już konto?{" "}
                <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                  Zaloguj się
                </Link>
              </p>
            </div>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
