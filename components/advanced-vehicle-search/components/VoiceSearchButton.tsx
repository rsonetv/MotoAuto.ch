"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mic, MicOff } from "lucide-react"
import { useVoiceSearch } from "../hooks/useVoiceSearch"
import { useEffect } from "react"

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

export function VoiceSearchButton({ onTranscript, className }: VoiceSearchButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceSearch()

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript)
    }
  }, [transcript, onTranscript])

  if (!isSupported) {
    return null
  }

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={`touch-friendly ${isListening ? 'voice-pulse text-red-500' : ''} ${className}`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Zatrzymaj nagrywanie' : 'Szukaj głosowo'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}