"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { updatePassword } from "@/lib/actions/user"

const passwordFormSchema = z.object({
  new_password: z.string().min(6, "Nowe hasło musi mieć co najmniej 6 znaków."),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordForm() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    mode: "onChange",
  })

  async function onSubmit(data: PasswordFormValues) {
    try {
      await updatePassword(data)
      toast({
        title: "Sukces",
        description: "Hasło zostało pomyślnie zaktualizowane.",
      })
      form.reset({ new_password: "" })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas aktualizacji hasła.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nowe hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Zmień hasło</Button>
      </form>
    </Form>
  )
}