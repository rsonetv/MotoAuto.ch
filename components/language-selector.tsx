'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const languages = [
  { code: 'pl', label: 'PL' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'it', label: 'IT' },
]

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const router = useRouter()

  return (
    <div className="flex gap-2 justify-center mb-6">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLang === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => router.push(`/how-it-works/${lang.code}`)}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  )
}
