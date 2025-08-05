"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Instagram,
  Linkedin,
  Copy,
  Check,
  ExternalLink
} from "lucide-react"
import { SocialSharingProps } from "../schema"
import { formatShareText } from "../string-formatters"

export function SocialSharingModal({
  platforms,
  shareText,
  shareUrl,
  vehicleData,
  onShare
}: SocialSharingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customText, setCustomText] = useState(shareText)
  const [copied, setCopied] = useState(false)

  const platformIcons: Record<string, any> = {
    facebook: Facebook,
    twitter: Twitter,
    whatsapp: MessageCircle,
    instagram: Instagram,
    linkedin: Linkedin
  }

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-600 hover:bg-blue-700',
    twitter: 'bg-sky-500 hover:bg-sky-600',
    whatsapp: 'bg-green-600 hover:bg-green-700',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    linkedin: 'bg-blue-700 hover:bg-blue-800'
  }

  const handleShare = async (platformName: string) => {
    const platform = platforms.find(p => p.name.toLowerCase() === platformName)
    if (!platform) return

    const text = encodeURIComponent(customText)
    const url = encodeURIComponent(shareUrl)
    const title = encodeURIComponent(vehicleData.title)

    let shareUrlFinal = ''

    switch (platformName) {
      case 'facebook':
        shareUrlFinal = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
        break
      case 'twitter':
        shareUrlFinal = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case 'whatsapp':
        shareUrlFinal = `https://wa.me/?text=${text}%20${url}`
        break
      case 'linkedin':
        shareUrlFinal = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${text}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy to clipboard
        await copyToClipboard(`${customText} ${shareUrl}`)
        toast.success('Skopiowano do schowka!', {
          description: 'Wklej w Instagram Stories lub Posts'
        })
        onShare?.(platformName)
        return
      default:
        return
    }

    // Open share window
    const width = 600
    const height = 400
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    window.open(
      shareUrlFinal,
      'share',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )

    onShare?.(platformName)
    
    toast.success(`Udostępniono na ${platform.name}!`)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Link skopiowany!')
    } catch (error) {
      toast.error('Nie udało się skopiować')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicleData.title,
          text: customText,
          url: shareUrl
        })
        onShare?.('native')
      } catch (error) {
        // User cancelled sharing
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="touch-optimized">
          <Share2 className="w-4 h-4 mr-2" />
          Udostępnij
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Udostępnij pojazd</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {vehicleData.title.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{vehicleData.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatShareText(vehicleData.title, vehicleData.price, '')}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {vehicleData.price.toLocaleString()} CHF
                </Badge>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="customText">Dostosuj wiadomość</Label>
            <Input
              id="customText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Dodaj własną wiadomość..."
              className="touch-optimized"
            />
          </div>

          {/* Native Share (if supported) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full touch-optimized"
              variant="outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Udostępnij przez system
            </Button>
          )}

          {/* Social Platforms */}
          <div className="space-y-3">
            <Label>Wybierz platformę</Label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => {
                const IconComponent = platformIcons[platform.name.toLowerCase()]
                const colorClass = platformColors[platform.name.toLowerCase()]
                
                return (
                  <Button
                    key={platform.name}
                    onClick={() => handleShare(platform.name.toLowerCase())}
                    className={`touch-optimized text-white ${colorClass}`}
                    variant="default"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                    {platform.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Link bezpośredni</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="touch-optimized"
              />
              <Button
                onClick={() => copyToClipboard(shareUrl)}
                variant="outline"
                size="icon"
                className="touch-optimized shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Stats */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Udostępnianie pomaga znaleźć kupców!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}