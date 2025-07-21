"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

const languages = [
  { code: "de-CH", name: "Deutsch", flag: "🇨🇭" },
  { code: "fr-CH", name: "Français", flag: "🇫🇷" },
  { code: "it-CH", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("de-CH")
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode)

    // Store language preference
    localStorage.setItem("preferred-language", langCode)

    // In a real implementation, you would update the URL or context
    // For now, we'll just update the state
    console.log("Language changed to:", langCode)
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLang === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
