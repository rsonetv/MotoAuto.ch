import { Suspense } from "react"
import { requireGuest } from "@/lib/auth-helpers"
import LoginForm from "@/components/auth/login-form"

export default async function LoginPage() {
  await requireGuest()

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="m8 3 4 8 5-5v11H5V6l3-3z" />
          </svg>
          MotoAuto.ch
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;Najlepsze miejsce do kupna i sprzedaży pojazdów w Szwajcarii.&rdquo;</p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Suspense fallback={<div>Ładowanie...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
