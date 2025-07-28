"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, Loader2, ImageIcon, Check } from "lucide-react"
import { toast } from "sonner"

interface AsyncImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void
}

export function AsyncImageUpload({ onImagesUploaded }: AsyncImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; status: "uploading" | "complete" | "error"; progress: number }>>([])
  const [isUploading, setIsUploading] = useState(false)

  const compressImage = async (file: File, maxWidth = 1200, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new window.Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1)
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
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    
    // Create placeholder entries for each file
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      status: "uploading" as const,
      progress: 0,
      file
    }))
    
    setUploadedImages(prev => [...prev, ...newImages])
    
    // Process each file
    for (const imageData of newImages) {
      try {
        // Compress the image
        const compressedFile = await compressImage(imageData.file)
        
        // Simulate upload with progress
        await simulateUpload(imageData.id)
        
        // Update status to complete
        setUploadedImages(prev => prev.map(img => 
          img.id === imageData.id 
            ? {...img, status: "complete" as const, progress: 100} 
            : img
        ))
      } catch (error) {
        console.error("Upload failed:", error)
        setUploadedImages(prev => prev.map(img => 
          img.id === imageData.id 
            ? {...img, status: "error" as const} 
            : img
        ))
        toast.error(`Failed to upload ${imageData.file.name}`)
      }
    }
    
    setIsUploading(false)
    
    // Notify parent component of uploaded images
    const completedUrls = uploadedImages
      .filter(img => img.status === "complete")
      .map(img => img.url)
    
    onImagesUploaded(completedUrls)
  }, [uploadedImages, onImagesUploaded])
  
  // Simulate upload with progress updates
  const simulateUpload = async (imageId: string) => {
    return new Promise<void>((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          resolve()
        }
        
        setUploadedImages(prev => prev.map(img => 
          img.id === imageId 
            ? {...img, progress} 
            : img
        ))
      }, 300)
    })
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 10485760, // 10MB
  })

  useEffect(() => {
    // Update parent component with completed images
    const completedUrls = uploadedImages
      .filter(img => img.status === "complete")
      .map(img => img.url)
    
    onImagesUploaded(completedUrls)
  }, [uploadedImages, onImagesUploaded])

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <UploadCloud className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">Przeciągnij i upuść zdjęcia lub kliknij, aby wybrać</h3>
          <p className="text-sm text-gray-500">
            Maksymalnie 10 zdjęć (JPG, PNG, WebP), do 10MB każde
          </p>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group border rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image 
                  src={image.url} 
                  alt="Vehicle" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                
                {image.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                    <div className="w-3/4 mt-2">
                      <Progress value={image.progress} className="h-2" />
                    </div>
                  </div>
                )}
                
                {image.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                    <X className="h-8 w-8 text-white" />
                  </div>
                )}
                
                {image.status === "complete" && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(image.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
