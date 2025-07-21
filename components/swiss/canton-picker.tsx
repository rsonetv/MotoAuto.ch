"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { SWISS_CANTONS } from "@/lib/swiss/locations"

interface CantonPickerProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  language?: "de" | "fr" | "it" | "en"
}

export function CantonPicker({
  value,
  onValueChange,
  placeholder = "Wählen Sie einen Kanton...",
  language = "de",
}: CantonPickerProps) {
  const [open, setOpen] = useState(false)

  const getCantonName = (canton: (typeof SWISS_CANTONS)[0]) => {
    switch (language) {
      case "fr":
        return canton.name_fr
      case "it":
        return canton.name_it
      case "en":
        return canton.name
      default:
        return canton.name_de
    }
  }

  const selectedCanton = SWISS_CANTONS.find((canton) => canton.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedCanton ? getCantonName(selectedCanton) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Kanton suchen..." />
          <CommandList>
            <CommandEmpty>Kein Kanton gefunden.</CommandEmpty>
            <CommandGroup>
              {SWISS_CANTONS.map((canton) => (
                <CommandItem
                  key={canton.code}
                  value={canton.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === canton.code ? "opacity-100" : "opacity-0")} />
                  {getCantonName(canton)} ({canton.code})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
