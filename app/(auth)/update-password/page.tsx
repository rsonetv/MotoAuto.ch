import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ustaw nowe hasło</CardTitle>
          <CardDescription>
            Wprowadź swoje nowe hasło poniżej.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Ładowanie...</div>}>
            <UpdatePasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}