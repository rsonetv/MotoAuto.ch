"use client"

import { Button } from "@/components/ui/button"

interface Props {
  vehicle: any
}

export function ContactPanel({ vehicle }: Props) {
  return (
    <aside className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Skontaktuj się ze sprzedawcą</h2>
      <p>Email: przykład@sprzedawca.ch</p>
      <Button className="w-full">Wyślij wiadomość</Button>
    </aside>
  )
}
