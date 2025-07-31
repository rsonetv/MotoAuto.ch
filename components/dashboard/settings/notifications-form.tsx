"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { updateNotificationSettings } from "@/lib/actions/user"

const notificationsFormSchema = z.object({
  new_offers: z.boolean().default(false),
  bid_updates: z.boolean().default(true),
  newsletter: z.boolean().default(false),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function NotificationsForm({
  settings,
}: {
  settings: NotificationsFormValues
}) {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: settings,
  })

  async function onSubmit(data: NotificationsFormValues) {
    try {
      await updateNotificationSettings(data)
      toast({
        title: "Sukces",
        description: "Ustawienia powiadomień zostały pomyślnie zaktualizowane.",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas aktualizacji ustawień powiadomień.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Powiadomienia E-mail</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="new_offers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nowe oferty</FormLabel>
                    <FormDescription>
                      Otrzymuj powiadomienia o nowych ofertach i promocjach.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bid_updates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Aktualizacje licytacji
                    </FormLabel>
                    <FormDescription>
                      Otrzymuj powiadomienia o statusie swoich licytacji.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Newsletter</FormLabel>
                    <FormDescription>
                      Otrzymuj cotygodniowy newsletter z nowościami.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Zaktualizuj powiadomienia</Button>
      </form>
    </Form>
  )
}