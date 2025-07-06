"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success("Zalogowano pomyślnie!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Nie udało się zalogować")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formularz logowania">
      <div className="space-y-2">
        <Label htmlFor="email">Adres email</Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Hasło</Label>
          <a href="/auth/reset" className="text-sm text-blue-400 hover:text-blue-300">
            Zapomniałeś hasła?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? "Logowanie..." : "Zaloguj się"}
      </Button>
    </form>
  )
}
