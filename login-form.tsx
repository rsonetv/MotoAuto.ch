"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", formData)
  }

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log("Google login attempt")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and heading */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">
              MotoAuto<span className="text-red-500">.ch</span>
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Zaloguj się na swoje konto</h2>
              <p className="text-gray-400">
                Nie masz konta?{" "}
                <Link href="/register" className="text-blue-500 hover:text-blue-400">
                  Zarejestruj się
                </Link>
              </p>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Adres email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="twoj@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Hasło
                </Label>
                <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400">
                  Zapomniałeś hasła?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={handleCheckboxChange}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-300">
                Zapamiętaj mnie
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Zaloguj się
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-900 px-2 text-gray-400">Lub kontynuuj z</span>
            </div>
          </div>

          {/* Google login */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800 font-medium py-3 rounded-lg transition-colors"
          >
            Kontynuuj z Google
          </Button>
        </div>
      </div>

      {/* Right side - Car image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/green-car.png" alt="Green sports car" fill className="object-cover" priority />
      </div>
    </div>
  )
}
