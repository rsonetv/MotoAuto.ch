import { RegisterForm } from "@/components/forms/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-foreground hover:text-primary transition-colors">
            MotoAuto<span className="text-red-600">.ch</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Wróć do{" "}
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
              strony głównej
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
