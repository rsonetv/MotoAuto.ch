"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { updatePasswordAction } from "@/app/(auth)/update-password/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Zapisywanie..." : "Zapisz nowe hasło"}
    </Button>
  );
}

export function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [state, formAction] = useFormState(updatePasswordAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="code" value={code || ""} />
      <div className="space-y-2">
        <Label htmlFor="password">Nowe hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
        />
      </div>
      {state?.fieldErrors?.password && (
        <p className="text-sm text-red-500">{state.fieldErrors.password}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Potwierdź nowe hasło</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={6}
        />
      </div>
      {state?.fieldErrors?.confirm_password && (
        <p className="text-sm text-red-500">{state.fieldErrors.confirm_password}</p>
      )}
      <SubmitButton />
    </form>
  );
}