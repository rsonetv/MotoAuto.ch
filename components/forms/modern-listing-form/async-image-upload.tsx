"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  UploadCloud, 
  X, 
  Loader2, 
  ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Trash2
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  status: "uploading" | "completed" | "error"
  progress: number
}

interface AsyncImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  maxFileSize?: number // w MB
}

export function AsyncImageUpload({ 
  onImagesUploaded, 
  maxImages = 20, 
  maxFileSize = 10 
}: AsyncImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Kompresja obrazu
  const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new window.Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          "image/jpeg",
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Upload pojedynczego zdjęcia
  const uploadSingleImage = async (file: File): Promise<string> => {
    const imageId = Math.random().toString(36).substring(7)
    
    // Dodaj obraz do stanu z statusem "uploading"
    const newImage: UploadedImage = {
      id: imageId,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
    }

    setImages(prev => [...prev, newImage])

    try {
      // Kompresja obrazu
      const compressedFile = await compressImage(file)
      
      // Przygotowanie FormData
      const formData = new FormData()
      formData.append("image", compressedFile)
      formData.append("folder", "listings")

      // Symulacja postępu uploadu
      const updateProgress = (progress: number) => {
        setImages(prev => prev.map(img => 
          img.id === imageId ? { ...img, progress } : img
        ))
      }

      // Symulacja postępu
      updateProgress(25)
      await new Promise(resolve => setTimeout(resolve, 500))
      updateProgress(50)
      await new Promise(resolve => setTimeout(resolve, 500))
      updateProgress(75)

      // Rzeczywisty upload
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Błąd podczas przesyłania zdjęcia")
      }

      const result = await response.json()
      updateProgress(100)

      // Aktualizuj status na "completed"
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: "completed", url: result.url, progress: 100 }
          : img
      ))

      return result.url

    } catch (error) {
      console.error("Błąd uploadu:", error)
      
      // Aktualizuj status na "error"
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, status: "error" } : img
      ))

      throw error
    }
  }

  // Obsługa drop/select plików
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Możesz przesłać maksymalnie ${maxImages} zdjęć`)
      return
    }

    setIsUploading(true)
    const uploadPromises: Promise<string>[] = []

    for (const file of acceptedFiles) {
      // Sprawdź rozmiar pliku
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest za duży. Maksymalny rozmiar: ${maxFileSize}MB`)
        continue
      }

      uploadPromises.push(uploadSingleImage(file))
    }

    try {
      const uploadedUrls = await Promise.allSettled(uploadPromises)
      const successfulUrls = uploadedUrls
        .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
        .map(result => result.value)

      // Aktualizuj listę przesłanych zdjęć
      const completedImages = images
        .filter(img => img.status === "completed")
        .map(img => img.url)
      
      onImagesUploaded([...completedImages, ...successfulUrls])

      if (successfulUrls.length > 0) {
        toast.success(`Przesłano ${successfulUrls.length} zdjęć`)
      }

    } catch (error) {
      toast.error("Wystąpił błąd podczas przesyłania zdjęć")
    } finally {
      setIsUploading(false)
    }
  }, [images, maxImages, maxFileSize, onImagesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: isUploading || images.length >= maxImages
  })

  // Usuń zdjęcie
  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      const completedUrls = updated
        .filter(img => img.status === "completed")
        .map(img => img.url)
      onImagesUploaded(completedUrls)
      return updated
    })
  }

  // Ponów upload
  const retryUpload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    // Tutaj można zaimplementować logikę ponownego uploadu
    toast.info("Funkcja ponownego uploadu zostanie wkrótce dodana")
  }

  const completedImages = images.filter(img => img.status === "completed")
  const uploadingImages = images.filter(img => img.status === "uploading")
  const errorImages = images.filter(img => img.status === "error")

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          (isUploading || images.length >= maxImages) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Upuść zdjęcia tutaj...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Przeciągnij i upuść zdjęcia lub <span className="text-blue-600 font-medium">kliknij aby wybrać</span>
            </p>
            <p className="text-sm text-gray-500">
              Maksymalnie {maxImages} zdjęć, każde do {maxFileSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Statystyki */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Przesłane: {completedImages.length}
          </Badge>
          {uploadingImages.length > 0 && (
            <Badge variant="outline" className="text-blue-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Przesyłanie: {uploadingImages.length}
            </Badge>
          )}
          {errorImages.length > 0 && (
            <Badge variant="outline" className="text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Błędy: {errorImages.length}
            </Badge>
          )}
        </div>
      )}

      {/* Lista zdjęć */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay z statusem */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    {image.status === "completed" && (
                      <>
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {image.status === "error" && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => retryUpload(image.id)}
                      >
                        Ponów
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  {image.status === "uploading" && (
                    <div className="bg-white rounded-full p-1">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  )}
                  {image.status === "completed" && (
                    <div className="bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {image.status === "error" && (
                    <div className="bg-red-500 rounded-full p-1">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar dla uploading */}
              {image.status === "uploading" && (
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2">
                  <Progress value={image.progress} className="h-1" />
                  <p className="text-xs text-center mt-1">{image.progress}%</p>
                </div>
              )}

              {/* Nazwa pliku */}
              <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                {image.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}