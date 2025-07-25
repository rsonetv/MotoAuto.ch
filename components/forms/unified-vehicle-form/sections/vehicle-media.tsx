"use client"

import { useState, useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"
import type { UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"

// Enhanced image compression
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
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export function VehicleMedia() {
  const { control, setValue, getValues } = useFormContext<UnifiedVehicleFormValues>()
  const [imageFiles, setImageFiles] = useState(getValues("images") || [])
  const [isCompressing, setIsCompressing] = useState(false)

  const onDropImages = useCallback(
    async (acceptedFiles: File[]) => {
      setIsCompressing(true)
      const newFiles = []

      for (const file of acceptedFiles) {
        try {
          const compressedFile = await compressImage(file)
          const fileWithPreview = {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            name: file.name,
            size: compressedFile.size,
          }
          newFiles.push(fileWithPreview)
        } catch (error) {
          console.error("Error compressing image:", error)
        }
      }

      const allFiles = [...imageFiles, ...newFiles].slice(0, 12)
      setImageFiles(allFiles)
      setValue("images", allFiles, { shouldValidate: true })
      setIsCompressing(false)
    },
    [imageFiles, setValue],
  )

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    URL.revokeObjectURL(newFiles[index].preview)
    newFiles.splice(index, 1)
    setImageFiles(newFiles)
    setValue("images", newFiles, { shouldValidate: true })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    maxFiles: 12,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Zdjęcia
          <Badge variant="outline">{imageFiles.length}/12</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isCompressing ? (
                        <Loader2 className="w-8 h-8 mb-4 text-blue-500 animate-spin" />
                      ) : (
                        <UploadCloud className="w-8 h-8 mb-4 text-gray-400" />
                      )}
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        {isCompressing ? "Kompresowanie..." : isDragActive ? "Upuść zdjęcia" : "Dodaj zdjęcia"}
                      </p>
                      {!isCompressing && <p className="text-xs text-gray-500 text-center">PNG, JPG, WEBP (max 10MB)</p>}
                    </div>
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Podgląd zdjęć</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            imageFiles.forEach((file) => URL.revokeObjectURL(file.preview))
                            setImageFiles([])
                            setValue("images", [])
                          }}
                        >
                          Usuń wszystkie
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {imageFiles.map((fileWithPreview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-square">
                              <Image
                                src={fileWithPreview.preview || "/placeholder.svg"}
                                alt={`Podgląd ${index + 1}`}
                                fill
                                className="object-cover rounded-lg"
                                onLoad={() => URL.revokeObjectURL(fileWithPreview.preview)}
                              />
                              {index === 0 && (
                                <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">Główne</Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
