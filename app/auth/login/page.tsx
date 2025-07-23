import { LoginForm } from "@/components/forms/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold">
            MotoAuto<span className="text-red-500">.ch</span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Wróć do{" "}
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              strony głównej
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
