"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { resetPasswordAction } from "@/app/(auth)/reset-password/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Wysyłanie..." : "Wyślij link do resetowania hasła"}
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("Jeśli konto istnieje, link do zresetowania hasła został wysłany na Twój e-mail.");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adres e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jan.kowalski@example.com"
          required
        />
      </div>
      {state?.fieldErrors?.email && (
        <p className="text-sm text-red-500">{state.fieldErrors.email}</p>
      )}
      <SubmitButton />
    </form>
  );
}