"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function AddVehicleForm() {
  const [title, setTitle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Zapisano: ${title} (demo)`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      <div className="space-y-2">
        <Label htmlFor="title">Tytuł</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      {/* Add more fields later */}
      <Button type="submit">Dodaj ogłoszenie</Button>
    </form>
  )
}
