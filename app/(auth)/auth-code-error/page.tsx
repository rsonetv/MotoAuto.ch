import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Błąd uwierzytelniania</h1>
          <p className="text-sm text-muted-foreground">Wystąpił problem z kodem uwierzytelniania</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nieprawidłowy kod uwierzytelniania</AlertTitle>
          <AlertDescription>
            Link uwierzytelniania jest nieprawidłowy lub wygasł. Spróbuj ponownie zalogować się lub zarejestrować.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-2">
          <Button asChild>
            <a href="/auth/login">Przejdź do logowania</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/auth/register">Utwórz nowe konto</a>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Jeśli problem się powtarza, skontaktuj się z{" "}
            <a href="mailto:support@motoauto.ch" className="underline">
              wsparciem technicznym
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
