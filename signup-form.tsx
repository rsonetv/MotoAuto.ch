import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function Component() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Motorcycle image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src="/motorcycle.png" alt="Motorcycle in garage" className="w-full h-full object-cover" />
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              MotoAuto<span className="text-red-500">.ch</span>
            </h1>
          </div>

          {/* Form header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Stwórz nowe konto</h2>
            <p className="text-gray-400">
              Masz już konto?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                Zaloguj się
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Imię i nazwisko
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Adres email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Hasło
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                Akceptuję{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  regulamin
                </Link>{" "}
                oraz{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  politykę prywatności
                </Link>
                .
              </Label>
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 mt-6">
              Zarejestruj się
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
