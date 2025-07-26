"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Image as ImageIcon, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadSectionProps {
  images: string[]
  onUpload: (files: File[]) => Promise<void>
  onRemove: (index: number) => void
  maxImages?: number
}

export function ImageUploadSection({
  images,
  onUpload,
  onRemove,
  maxImages = 20,
}: ImageUploadSectionProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        alert(`Możesz dodać maksymalnie ${maxImages} zdjęć`)
        return
      }

      // Symulacja postępu uploadu
      acceptedFiles.forEach((file) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        // Symulacja postępu
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0
            if (currentProgress >= 100) {
              clearInterval(interval)
              return prev
            }
            return { ...prev, [file.name]: currentProgress + 10 }
          })
        }, 100)
      })

      await onUpload(acceptedFiles)

      // Wyczyść postęp po zakończeniu
      setTimeout(() => {
        setUploadProgress({})
      }, 1000)
    },
    [images.length, maxImages, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: maxImages - images.length,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const handleRemoveImage = (index: number) => {
    onRemove(index)
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className={cn(
        "border-2 border-dashed transition-colors cursor-pointer",
        isDragActive || dropzoneActive 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-primary/50"
      )}>
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {isDragActive || dropzoneActive ? (
                <Upload className="w-8 h-8 text-primary" />
              ) : (
                <Camera className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive || dropzoneActive 
                ? "Upuść zdjęcia tutaj" 
                : "Dodaj zdjęcia pojazdu"
              }
            </h3>
            
            <p className="text-muted-foreground mb-4">
              Przeciągnij i upuść zdjęcia lub kliknij, aby wybrać pliki
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Obsługiwane formaty: JPEG, PNG, WebP, GIF</span>
              <span>•</span>
              <span>Maksymalnie {maxImages} zdjęć</span>
              <span>•</span>
              <span>Maksymalny rozmiar: 10MB</span>
            </div>
            
            <Button type="button" variant="outline" className="pointer-events-none">
              <ImageIcon className="w-4 h-4 mr-2" />
              Wybierz zdjęcia
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Przesyłanie zdjęć...</h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Zdjęcia pojazdu ({images.length}/{maxImages})
            </h4>
            <p className="text-sm text-muted-foreground">
              Pierwsze zdjęcie będzie zdjęciem głównym
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={`Zdjęcie pojazdu ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Overlay z przyciskami */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Badge dla głównego zdjęcia */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Główne
                    </div>
                  )}
                  
                  {/* Numer zdjęcia */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wskazówki */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Wskazówki dotyczące zdjęć</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Dodaj zdjęcia z różnych stron pojazdu (przód, tył, boki, wnętrze)</li>
            <li>• Pierwsze zdjęcie będzie wyświetlane jako główne w wynikach wyszukiwania</li>
            <li>• Używaj dobrego oświetlenia - najlepiej światło dzienne</li>
            <li>• Unikaj zdjęć rozmazanych lub zbyt ciemnych</li>
            <li>• Pokaż ewentualne uszkodzenia lub ślady użytkowania</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}