"use client"
import Image from "next/image"
import UpdatePasswordForm from "@/components/auth/update-password-form"

export default function UpdatePasswordClientPage() {
  return (
    <>
      <UpdatePasswordForm />
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/motorcycle.png" alt="Motorcycle" fill className="object-cover" priority />
      </div>
    </>
  )
}
